import {VersionFollowTypeMap as versionFollowTypeMap} from "../services/shared-models/shared-models.subdocs.schema.js";

export async function addFollowSupportToSharedModelsCommand(app) {
  const sharedModelsService = app.service('shared-models');
  const smDb = await sharedModelsService.options.Model;
  const modelService = app.service('models');
  const mDb = await modelService.options.Model;
  const fileService = app.service('file');
  const fDb = await fileService.options.Model;

  const sharedModelCache = {};
  const modelCache = {};
  const fileCache = {};
  let refList = null;

  console.log('>>> creating reference cache of all SharedModels');
  refList = await smDb.find(
    {},
    {
      projection: {
        _id: 1,
        versionFollowing: 1,
        cloneModelId: 1,
        dummyModelId: 1,
        modelId: 1, // a legacy entry; should not be there
        fileDetail: 1,
        deleted: 1,
      }
    }
  ).toArray();
  for (let ref of refList) {
    sharedModelCache[ref._id.toString()] = ref;
  }
  console.log(`>>>   cached ${refList.length}`);

  console.log('>>> creating reference cache of all Models');
  refList = await mDb.find(
    {},
    {
      projection: {
        _id: 1,
        userId: 1,
        fileId: 1,
        sharedModelId: 1,
      }
    }
  ).toArray();
  for (let ref of refList) {
    modelCache[ref._id.toString()] = ref;
  }
  console.log(`>>>   cached ${refList.length}`);

  console.log('>>> creating reference cache of all Files');
  refList = await fDb.find(
    {},
    {
      projection: {
        _id: 1,
        modelId: 1,
        isSystemGenerated: 1,
        versions: 1,
        followingActiveSharedModels: 1,
      }
    }
  ).toArray();
  for (let ref of refList) {
    fileCache[ref._id.toString()] = ref;
  }
  console.log(`>>>   cached ${refList.length}`);

  // /////////////////////////////////////////
  //
  //      SHARED MODELS
  //
  // /////////////////////////////////////////
  console.log('>>> changing each SharedModel');
  let problemCount = 0;
  for (const id in sharedModelCache ) {
    if (sharedModelCache.hasOwnProperty(id)) {
      console.log(`>>>   sm ${id}`);
      let changes = {};
      const sm = sharedModelCache[id];
      //
      // fileDetail
      //
      if (!sm.fileDetail) {
        if (sm.versionFollowing === versionFollowTypeMap.active) {
          // this is the new option and means the fileDetail SHOULD ALREADY BE SET
          console.log(`>>>     PROBLEM!!! fileDetail missing on Active versionFollowing`)
          problemCount += 1;
        } else {
          // else assume versionFollowing is 'locked'; which is the default
          // The fileDetail points to the live file.
          // BUT, to determine the version, you need the stub file.
          let finalFileId = null;
          let finalVersionId = null;
          let targetVersionUniqueFileName = null;
          let targetVersionUniqueDate = null;

          let dummyModelId = sm.dummyModelId
          if (!dummyModelId) {
            if (sm.modelId) {
              dummyModelId = sm.modelId;
              changes.dummyModelId = sm.modelId;
              console.log('>>>     dummyModelId missing but legacy modelId exists; so using that instead');
            }
          }
          if (dummyModelId && modelCache.hasOwnProperty(dummyModelId.toString())) {
            let model = modelCache[dummyModelId.toString()];
            if (!model.fileId) {
              if (sm.deleted) {
                console.log(`>>>     model ${dummyModelId} is missing FileId but that is okay for a deleted item`);
              } else {
                console.log(`>>>     PROBLEM!!! ${dummyModelId} is missing the FileId field.`);
                problemCount += 1;
              }
            } else {
              let stubFileId = model.fileId.toString();
              if (fileCache.hasOwnProperty(stubFileId)) {
                let file = fileCache[stubFileId];
                if (file.versions.length !== 1) {
                  console.log(`>>>     PROBLEM!!! file ${stubFileId} has ${file.versions.length} versions rather than 1`)
                } else {
                  targetVersionUniqueFileName = file.versions[0].uniqueFileName;
                  targetVersionUniqueDate = file.versions[0].createdAt;
                }
              } else {
                console.log(`>>>     PROBLEM!!! failure to locate file ${fileId}`);
                problemCount += 1;
              }
            }
          } else {
            if (sm.deleted) {
              console.log(`>>>     unable to locate dummyModelId/modelId ${dummyModelId} but that is okay for a deleted item`);
            } else {
              console.log(`>>>     PROBLEM!!! failure to locate dummyModelId/modelId ${dummyModelId}`);
              problemCount += 1;
            }
          }
          // now get the real file id
          if (targetVersionUniqueFileName || targetVersionUniqueDate) {
            const keyModelId = sm.cloneModelId;
            let keyFileArray = [];
            for (const fid in fileCache) {
              const file = fileCache[fid];
              if (file.modelId) {
                if (file.modelId.toString() === keyModelId.toString()) {
                  keyFileArray.push(file);
                }
              }
            }
            if (keyFileArray.length === 0) {
              if (sm.deleted) {
                console.log('>>>     No true file found, but this is a deleted shared-model so that is okay.');
              } else {
                console.log(`>>>     PROBLEM!!! failure to locate a true file pointing to model ${keyModelId}`);
              }
            } else if (keyFileArray.length > 1) {
              console.log(`>>>     PROBLEM!!! found MULTIPLE true files pointing to model ${keyModelId}`);
            } else {
              finalFileId = keyFileArray[0]._id;
              const matchingVersion = keyFileArray[0].versions.find(
                version => version.uniqueFileName === targetVersionUniqueFileName
              );
              if (matchingVersion) {
                finalVersionId = matchingVersion._id;
              } else {
                console.log(`>>>     PROBLEM!!! cannot find matching version in file ${finalFileId}`);
              }
            }
          }
          // put it together
          if (finalVersionId !== null && finalFileId) {
            changes.fileDetail = {fileId: finalFileId, versionId: finalVersionId}
          } else {
            console.log(`>>>     SKIPPING fileDetail`);
          }
        }
      }

      //
      // versionFollowing
      //
      if (!sm.versionFollowing) {
        changes.versionFollowing = versionFollowTypeMap.locked;
      }
      console.log(`>>>     changes: ${JSON.stringify(changes)}`);
    }
  }
  console.log(`>>> SharedModels serious problems: ${problemCount}`);

  console.log(`>>> command complete.`);
}
