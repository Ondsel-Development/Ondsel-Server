import {VersionFollowTypeMap as versionFollowTypeMap} from "../services/shared-models/shared-models.subdocs.schema.js";
import {buildSharedModelSummary} from "../services/shared-models/shared-models.distrib.js";
import {virtual} from "@feathersjs/schema";
import {buildFakeModelUrl} from "../services/shared-models/helpers.js";
import _ from "lodash";

export async function updateSharedModelsWithTitleCommand (app) {
  const sharedModelsService = app.service('shared-models');
  const smDb = await sharedModelsService.options.Model;
  const fileService = app.service('file');
  const fDb = await fileService.options.Model;

  const sharedModelCache = {};
  const fileCache = {};
  let refList = null;

  console.log('>>> creating reference cache of all SharedModels');
  refList = await smDb.find(
    { deleted: {$ne: true}},
    {
      projection: {
        _id: 1,
        fileDetail: 1,
        deleted: 1,
        isActive: 1,
        description: 1,
        title: 1,
        protection: 1,
        isThumbnailGenerated: 1,
        createdAt: 1,
      }
    }
  ).toArray();
  for (let ref of refList) {
    sharedModelCache[ref._id.toString()] = ref;
  }
  console.log(`>>>   cached ${refList.length}`);

  // console.log('>>> creating reference cache of all Files');
  // refList = await fDb.find(
  //   {},
  //   {
  //     projection: {
  //       _id: 1,
  //       modelId: 1,
  //       isSystemGenerated: 1,
  //       versions: 1,
  //       followingActiveSharedModels: 1,
  //       custFileName: 1,
  //       currentVersionId: 1,
  //     }
  //   }
  // ).toArray();
  // for (let ref of refList) {
  //   ref.$versionsChanged = false;
  //   for (let version of ref.versions) {
  //     if (version.lockedSharedModels === undefined) {
  //       version.lockedSharedModels = [];
  //       ref.$versionsChanged = true;
  //     }
  //   }
  //   fileCache[ref._id.toString()] = ref;
  // }
  // console.log(`>>>   cached ${refList.length}`);

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
      // title
      //
      if (!sm.title) {
        if (!sm.fileDetail) {
          console.log(`>>>     SKIPPING as fileDetail missing (implying broken model)`);
        } else {
          const newTitle = (sm.createdAt && sm.createdAt > 0) ? `Shared Link from ${dateFormat(sm.createdAt)}` : 'Shared Link';
          changes.title = newTitle;
          sm.title = newTitle; // for later use by files
          console.log(`>>>     updating title to \"${newTitle}\"`);
        }
      }

      //
      // make the change
      //
      if (!_.isEmpty(changes)) {
        console.log(`>>>     changes: ${JSON.stringify(changes)}`);
        let dbResult = null;
        try {
          dbResult = await sharedModelsService.patch(
            sm._id.toString(),
            changes,
          )
        } catch (e) {
          console.log(dbResult);
          console.log(e);
        }
        // console.log(`>>>     change result: ${JSON.stringify(dbResult)}`);
      }
    }
  }
  // /////////////////////////////////////////
  //
  //      FILES
  //
  // /////////////////////////////////////////
  // console.log('>>> changing each File');
  // // for (const id in fileCache ) {
  // //   console.log(`>>>   file ${id}`);
  // //   let changes = {};
  // //   let file = fileCache[id];
  // //   if (file.$versionsChanged) {
  // //     changes.versions = file.versions; // this picks up the lockedSharedModels array in each version
  // //   }
  // //   if (file.followingActiveSharedModels === undefined) {
  // //     changes.followingActiveSharedModels = [];
  // //   }
  // //   //
  // //   // make the change
  // //   //
  // //   if (!_.isEmpty(changes)) {
  // //     console.log(`>>>     changes: ${JSON.stringify(changes)}`);
  // //     const dbResult = await fDb.updateOne(
  // //       { _id: file._id },
  // //       {
  // //         $set: changes,
  // //       }
  // //     )
  // //     console.log(`>>>     change result: ${JSON.stringify(dbResult)}`);
  // //   }
  // // }
  // console.log('>>> done with Files')

  console.log(`>>> command complete.`);
}


function dateFormat(number) {
  const date = new Date(number);
  return date.toLocaleString();
}

