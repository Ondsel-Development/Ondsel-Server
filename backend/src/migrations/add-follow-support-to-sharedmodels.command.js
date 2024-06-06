import {VersionFollowTypeMap as versionFollowTypeMap} from "../services/shared-models/shared-models.subdocs.schema.js";

export async function addFollowSupportToSharedModels(app) {
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
        isSystemGenerated: 1,
        isOriginalModelForFile: 1,
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

  console.log('>>> changing each SharedModel');
  let problemCount = 0;
  for (const id in sharedModelCache ) {
    if (sharedModelCache.hasOwnProperty(id)) {
      console.log(`>>>   sm ${id}`);
      let changes = {};
      const sm = sharedModelCache[id];
      let versionFollowSet = null;
      if (!sm.fileDetail) {
        let versionId = null; // default
        if (sm.cloneModelId && modelCache.hasOwnProperty(sm.cloneModelId.toString())) {
          let model = modelCache[sm.cloneModelId.toString()];
          if (!model.fileId) {
            if (sm.deleted) {
              console.log(`>>>     model ${sm.cloneModelId.toString()} is missing FileId but that is okay for a deleted item`);
            } else {
              console.log(`>>>     PROBLEM!!! ${sm.cloneModelId.toString()} is missing the FileId field.`);
              problemCount += 1;
            }
          } else {
            let fileId = model.fileId.toString();
            if (sm.versionFollowing === versionFollowTypeMap.locked) {
              if (fileCache.hasOwnProperty(fileId)) {
                versionId = fileCache[fileId];
              } else {
                console.log(`>>>   failed to find find ${fileId}, so setting versionFollowing to Active`);
                versionFollowSet = versionFollowTypeMap.active;
              }
            }
            changes.fileDetail = {fileId: fileId, versionId: versionId}
          }
        } else {
          if (sm.deleted) {
            console.log(`>>>     unable to locate model ${sm.cloneModelId.toString()} but that is okay for a deleted item`);
          } else {
            console.log(`>>>     PROBLEM!!! failure to locate model ${sm.cloneModelId.toString()}`);
            problemCount += 1;
          }
        }
      }
      if (!sm.versionFollowing) {
        // the "default" behavior for existing SM is to be tracking the Active version of the file
        versionFollowSet =  versionFollowTypeMap.active;
      }
      if (versionFollowSet) {
        changes.versionFollowing = versionFollowSet;
      }
      console.log(`>>>     changes: ${JSON.stringify(changes)}`);
    }
  }
  console.log(`>>> SharedModels serious problems: ${problemCount}`);

  console.log(`>>> command complete.`);
}

