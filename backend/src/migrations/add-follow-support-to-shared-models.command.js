import {VersionFollowTypeMap as versionFollowTypeMap} from "../services/shared-models/shared-models.subdocs.schema.js";
import {buildSharedModelSummary} from "../services/shared-models/shared-models.distrib.js";
import {virtual} from "@feathersjs/schema";
import {buildFakeModelUrl} from "../services/shared-models/helpers.js";
import _ from "lodash";

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
        // the following are also needed for summaries:
        isActive: 1,
        description: 1,
        protection: 1,
        // custFileName is virtual
        isThumbnailGenerated: 1,
        // thumbnailUrl is virtual
        createdAt: 1,
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
        isThumbnailGenerated: 1,
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
        custFileName: 1,
        currentVersionId: 1,
      }
    }
  ).toArray();
  for (let ref of refList) {
    ref.$versionsChanged = false;
    for (let version of ref.versions) {
      if (version.lockedSharedModels === undefined) {
        version.lockedSharedModels = [];
        ref.$versionsChanged = true;
      }
    }
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
      let sm = sharedModelCache[id];
      //
      // versionFollowing
      //
      if (!sm.versionFollowing) {
        changes.versionFollowing = versionFollowTypeMap.locked;
      }

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
              const matchingVersionIndex = keyFileArray[0].versions.findIndex(
                version => version.uniqueFileName === targetVersionUniqueFileName
              );
              if (matchingVersionIndex !== -1) {
                // found it!
                let keyFile = keyFileArray[0];
                finalVersionId = keyFile.versions[matchingVersionIndex]._id;
                let keyModel = _.get(modelCache, keyModelId, null);
                await updateFileVersionEntryIfNeeded(keyFile, matchingVersionIndex, sm, keyModel, app)
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
      // make the change
      //
      if (!_.isEmpty(changes)) {
        console.log(`>>>     changes: ${JSON.stringify(changes)}`);
        const dbResult = await smDb.updateOne(
          { _id: sm._id },
          {
            $set: changes,
          }
        )
        console.log(`>>>     change result: ${JSON.stringify(dbResult)}`);
      }
    }
  }
  // /////////////////////////////////////////
  //
  //      FILES
  //
  // /////////////////////////////////////////
  console.log('>>> changing each File');
  for (const id in fileCache ) {
    console.log(`>>>   file ${id}`);
    let changes = {};
    let file = fileCache[id];
    await checkIfActiveVersionMissingThumbnail(file, modelCache, app);
    if (file.$versionsChanged) {
      changes.versions = file.versions; // this picks up the lockedSharedModels array in each version
    }
    if (file.followingActiveSharedModels === undefined) {
      changes.followingActiveSharedModels = [];
    }
    //
    // make the change
    //
    if (!_.isEmpty(changes)) {
      console.log(`>>>     changes: ${JSON.stringify(changes)}`);
      const dbResult = await fDb.updateOne(
        { _id: file._id },
        {
          $set: changes,
        }
      )
      console.log(`>>>     change result: ${JSON.stringify(dbResult)}`);
    }
  }
  console.log('>>> done with Files')


  console.log(`>>> SharedModels with serious problems: ${problemCount}`);

  console.log(`>>> command complete.`);
}

async function buildThumbnailUrlForLockedSharedModel(sm, app) {
  if (sm.isThumbnailGenerated) {
    const r = await app.service('upload').get(`public/${sm.dummyModelId.toString()}_thumbnail.PNG`);
    return r.url
  }
  return '';
}

async function updateFileVersionEntryIfNeeded(file, versionIndex, sm, model, app) {
  if (file.versions[versionIndex].lockedSharedModels.some(lsm => lsm._id.toString() === sm._id.toString() )) {
    console.log(`>>>     file ${file._id} already has shared-model`);
  } else {
    sm.model = {
      file: {
        custFileName: file.custFileName
      }
    };
    if (!sm.versionFollowing) {
      sm.versionFollowing = versionFollowTypeMap.locked;
    }
    sm.thumbnailUrl = await buildThumbnailUrlForLockedSharedModel(sm, app);
    const smSum = buildSharedModelSummary(sm);
    file.versions[versionIndex].lockedSharedModels.push(smSum);
    file.$versionsChanged = true;
    console.log(`>>>     also appended sm entry to file ${file._id} in version entry ${versionIndex}`);
  }
  // see if we can hydrate the thumbnailUrlCache
  if (!file.versions[versionIndex].thumbnailUrlCache) {
    if (model !== null && model.isThumbnailGenerated === true) {
      let currentVersionIdStr = file.currentVersionId.toString();
      if (file.versions[versionIndex]._id.toString() === currentVersionIdStr) {
        let newUrl = await upsertExistingThumbnailToVersion(currentVersionIdStr, model, app);
        file.versions[versionIndex].thumbnailUrlCache = newUrl;
        file.$versionsChanged = true;
        console.log(`>>>     also updated file ${file._id} version entry ${versionIndex} with thumbnailUrlCache ${newUrl}`)
      }
    }
  }
}

async function checkIfActiveVersionMissingThumbnail(file, modelCache, app){
  let versionIdStr = file.currentVersionId.toString();
  const verIndex = file.versions.findIndex(v => v._id.toString() === versionIdStr);
  if (file.modelId && file.deleted !== true) {
    if (verIndex > -1 && !file.versions[verIndex].thumbnailUrlCache) {
      const model = _.get(modelCache, file.modelId.toString(), null);
      if (model && !model.sharedModelId) {
        if (model.isThumbnailGenerated === true) {
          let newUrl = await upsertExistingThumbnailToVersion(versionIdStr, model, app);
          if (newUrl) {
            file.versions[verIndex].thumbnailUrlCache = newUrl;
            file.$versionsChanged = true;
            console.log(`>>>      duplicated model thumbnail to current active version via S3 to ${newUrl}`)
          } else {
            console.log(`>>>      UNABLE to duplicate model thumbnail to current active version via S3`)
          }
        }
      }
    }
  }
}

async function upsertExistingThumbnailToVersion(currentVersionIdStr, model, app) {
  const uploadService = app.service('upload');
  const fromUrl = `public/${model._id.toString()}_thumbnail.PNG`;
  const toUrl = `public/${model._id.toString()}_${currentVersionIdStr}_versionthumbnail.PNG`;
  try {
    await uploadService.upsert(fromUrl, toUrl);
    const finalUrlObj = await uploadService.get(toUrl);
    return finalUrlObj?.url;
  } catch {
    return undefined;
  }
}
