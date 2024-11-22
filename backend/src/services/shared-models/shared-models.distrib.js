// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import _ from 'lodash';
import {addSharedModelToFile, deleteSharedModelFromFile, updateSharedModelToFile} from "../file/file.distrib.js";
import {ProtectionType, VersionFollowType, VersionFollowTypeMap} from "./shared-models.subdocs.schema.js";
import {narrowlyUpdateSharedModelCurationRepresentativeFileUrl} from "./shared-models.curation.js";
import {ObjectId} from "mongodb";

export const sharedModelsSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    isActive: Type.Boolean({default: true}),
    title: Type.String(),
    description: Type.String(),
    versionFollowing: VersionFollowType,
    protection: ProtectionType,
    createdAt: Type.Number(),
    // Note: the following two fields are from Model an authoritative part of the SharedModel
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.Any(),
    // Note: the following field is from File and is not and authoritative part of the SharedModel
    custFileName: Type.String(),
  },
)

export const copySharedModelBeforePatch = async (context) => {
    // store a copy of the Org in `context.beforePatchCopy` to help detect true changes
    const smService = context.app.service('shared-models');
    const smDb = await smService.options.Model;
    const smId = new ObjectId(context.id);
    context.beforePatchCopy = await smDb.findOne({_id: smId}); // use direct DB so that it is found even if already deleted
    return context;
}

export function buildSharedModelSummary(sharedModel) {
    let summary = {};
    if (sharedModel) {
      summary = {
        _id: sharedModel._id,
        isActive: sharedModel.isActive,
        title: sharedModel.title,
        description: sharedModel.description,
        versionFollowing: sharedModel.versionFollowing,
        protection: sharedModel.protection,
        custFileName: sharedModel.model?.file?.custFileName || '',
        isThumbnailGenerated: sharedModel.isThumbnailGenerated,
        thumbnailUrl: sharedModel.thumbnailUrl,
        createdAt: sharedModel.createdAt,
      };
    }
    return summary;
}

//
// sending changes
//

export async function distributeSharedModelCreation(context){
  // for now, only file is updated
  try {
    let sharedModel = context.result;
    if (!sharedModel.model?.file) {
      const fileId = sharedModel.fileDetail.fileId;
      const realFile = await context.app.service('file').get(fileId);
      if (realFile) {
        sharedModel.model = {file: realFile};
      }
    }
    const sharedModelSummary = buildSharedModelSummary(sharedModel);
    await addSharedModelToFile(context.app, sharedModel.fileDetail, sharedModelSummary)
  } catch (error) {
    console.log(error);
  }
  return context;
}

export async function distributeSharedModelChanges(context){
  try {
    let changeDetected = false;
    let sharedModel = context.result;
    if (sharedModel.description !== context.beforePatchCopy.description) {
      changeDetected = true;
    }
    if (sharedModel.title !== context.beforePatchCopy.title) {
      changeDetected = true;
    }
    if (sharedModel.isActive !== context.beforePatchCopy.isActive) {
      changeDetected = true;
    }
    if (changeDetected) {
      const limitedSharedModelSummary = buildSharedModelSummary(sharedModel);
      await updateSharedModelToFile(context.app, sharedModel.fileDetail, limitedSharedModelSummary)
    }
  } catch (error) {
    console.log(error);
  }
  return context;
}

export async function distributeSharedModelDeletion(context){
  try {
    let sharedModel = context.result;
    await deleteSharedModelFromFile(context.app, sharedModel)
  } catch (error) {
    console.log(error);
  }
  return context;
}

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//

export async function applyThumbnailsToActiveFollowingSharedModels(app, model) {
  // used by the model UPDATE for sending new thumbnails to SharedModels that are versionFollowingActive
  // while the `model.file` virtual field needs no update, since it is dynamically built, the 'representativeFile' part
  // of curation needs to see changes.
  const fileService = app.service('file');
  const fileDb = await fileService.options.Model;
  const smService = app.service('shared-models');
  const smDb = await smService.options.Model;

  try {
    const file = await fileDb.findOne({ modelId: model._id })
    if (file) {
      const ver = file.versions.find(version => version._id.equals(file.currentVersionId));
      const url = ver?.thumbnailUrlCache;
      if (url) {
        const smList = await smDb.find(
          {
            deleted: {$ne: true},
            versionFollowing: VersionFollowTypeMap.active,
            cloneModelId: model._id,
          },
        ).toArray();
        for (const sharedModel of smList) {
          await narrowlyUpdateSharedModelCurationRepresentativeFileUrl(app, sharedModel, url, ver);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}