// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {VersionFollowTypeMap as versionFollowTypeMap} from "../services/shared-models/shared-models.subdocs.schema.js";
import {buildSharedModelSummary} from "../services/shared-models/shared-models.distrib.js";
import {virtual} from "@feathersjs/schema";
import {buildFakeModelUrl, generateDefaultTitle} from "../services/shared-models/helpers.js";
import _ from "lodash";

export async function updateDirectoriesWithTitleCommand (app) {
  const sharedModelsService = app.service('shared-models');
  const smDb = await sharedModelsService.options.Model;
  const dirService = app.service('directories');
  const dirDb = await dirService.options.Model;

  const sharedModelCache = {};
  const dirCache = {};
  let refList = null;

  console.log('>>> creating reference cache of all SharedModels (source of truth)');
  refList = await smDb.find(
    {
      deleted: {$ne: true},
      versionFollowing: `Locked`,
    },
    {
      projection: {
        _id: 1,
        title: 1,
        fileDetail: 1,
        versionFollowing: 1,
        isActive: 1,
        description: 1,
        protection: 1,
        custFileName: 1,
        isThumbnailGenerated: 1,
        thumbnailUrl: 1,
        createdAt: 1,
        dummyModelId: 1,
      }
    }
  ).toArray();
  for (let ref of refList) {
    sharedModelCache[ref._id.toString()] = ref;
  }
  console.log(`>>>   cached ${refList.length}`);

  console.log('>>> creating reference cache of all Directories');
  refList = await dirDb.find(
    {},
    {}
  ).toArray();
  for (let ref of refList) {
    dirCache[ref._id.toString()] = ref;
  }
  console.log(`>>>   cached ${refList.length}`);

  // /////////////////////////////////////////
  //
  //      DIRECTORIES
  //
  // /////////////////////////////////////////
  console.log('>>> changing each Directory');
  for (const id in dirCache ) {
    console.log(`>>>   dir ${id}`);
    let dir = dirCache[id];
    //
    // detect changes
    //
    let changeFound = false;
    for (const fileIndex in dir.files) {
      const file = dir.files[fileIndex];
      // find all related sharedModels of versionFollowing 'Locked' and make sure correct and inserted into `currentVersion`
      const smMatching = Object.values(sharedModelCache).filter(
        sm => sm.fileDetail &&
          sm.fileDetail.fileId.toString() === file._id.toString() &&
          sm.fileDetail.versionId.toString() === file.currentVersion._id.toString()
      );
      if (smMatching.length > 0) {
        if (file.currentVersion.lockedSharedModels === undefined) {
          changeFound = true;
          dir.files[fileIndex].currentVersion.lockedSharedModels = [];
        }
        for (const sm of smMatching) {
          if (!file.currentVersion.lockedSharedModels.find(lockedSm => lockedSm._id.toString() === sm._id.toString())) {
            changeFound = true;
            const smSum = buildSharedModelSummary(sm);
            await attemptToAddThumbnailForLockedSharedModel(app, sm, smSum);
            dir.files[fileIndex].currentVersion.lockedSharedModels.push(smSum);
          }
        }
      }
      // now explore in the other direction and find any missing titles
      for (const lockedSmIndex in file.currentVersion.lockedSharedModels || []) {
        const lockedSm = file.currentVersion.lockedSharedModels[lockedSmIndex];
        if (!lockedSm.title || !lockedSm.thumbnailUrl) {
          const sourceSm = sharedModelCache[lockedSm._id.toString()];
          if (!sourceSm) {
            changeFound = true;
            console.log('        DELETED or NON-LOCKED sharedModel found; removing it.');
            dir.files[fileIndex].currentVersion.lockedSharedModels = dir.files[fileIndex].currentVersion.lockedSharedModels.filter(
              t => t._id.toString() !== lockedSm._id.toString()
            );
          } else {
            const smSum = buildSharedModelSummary(sourceSm)
            await attemptToAddThumbnailForLockedSharedModel(app, sourceSm, smSum);
            if (!smSum.title) {
              console.log(`        SEVERE ERROR: Shared model ${smSum._id} does not have a title!!!!!.`);
              process.exit(1);
            }
            if (!lockedSm.title) {
              changeFound = true;
              dir.files[fileIndex].currentVersion.lockedSharedModels[lockedSmIndex] = smSum;
            }
            if (!lockedSm.thumbnailUrl) {
              if (smSum.thumbnailUrl) {
                changeFound = true;
                dir.files[fileIndex].currentVersion.lockedSharedModels[lockedSmIndex] = smSum;
              }
            }
          }
        }
      }
    }
    //
    // make the change
    //
    if (changeFound) {
      console.log(`>>>     new files: ${JSON.stringify(dir.files)}`);
      const dbResult = await dirDb.updateOne(
        { _id: dir._id },
        {
          $set: {
            files: dir.files,
          },
        }
      )
      console.log(`>>>     change result: ${JSON.stringify(dbResult)}`);
    }
  }
  console.log('>>> done with Directories')

  console.log(`>>> command complete.`);
}



async function attemptToAddThumbnailForLockedSharedModel(app, sharedModel, summary) {
  if (sharedModel.isThumbnailGenerated) {
    const r = await app.service('upload').get(`public/${sharedModel.dummyModelId.toString()}_thumbnail.PNG`);
    if (r.url) {
      summary.thumbnailUrl = r.url;
    } else {
      summary.thumbnailUrl = null;
    }
  }
}

