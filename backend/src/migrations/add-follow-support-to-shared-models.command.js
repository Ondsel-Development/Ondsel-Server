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
          let modelId = sm.dummyModelId
          if (!modelId) {
            if (sm.modelId) {
              modelId = sm.modelId;
              console.log('>>>     dummyModelId missing but legacy modelId exists; so using that instead');
              changes.dummyModelId = sm.modelId;
            }
          }
          if (modelId && modelCache.hasOwnProperty(modelId.toString())) {
            let model = modelCache[modelId.toString()];
            if (!model.fileId) {
              if (sm.deleted) {
                console.log(`>>>     model ${modelId} is missing FileId but that is okay for a deleted item`);
              } else {
                console.log(`>>>     PROBLEM!!! ${modelId} is missing the FileId field.`);
                problemCount += 1;
              }
            } else {
              let fileId = model.fileId.toString();
              if (fileCache.hasOwnProperty(fileId)) {
                let file = fileCache[fileId];
                if (file.versions.length !== 1) {
                  console.log(`>>>     PROBLEM!!! file ${fileId} has ${file.versions.length} versions rather than 1`)
                } else {
                  const fileVer = file.versions[0];
                  const versionId = fileVer._id;
                  changes.fileDetail = {fileId: fileId, versionId: versionId}
                }
              } else {
                console.log(`>>>     PROBLEM!!! failure to locate file ${fileId}`);
                problemCount += 1;
              }
            }
          } else {
            if (sm.deleted) {
              console.log(`>>>     unable to locate dummyModelId/modelId ${modelId} but that is okay for a deleted item`);
            } else {
              console.log(`>>>     PROBLEM!!! failure to locate dummyModelId/modelId ${modelId}`);
              problemCount += 1;
            }
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
