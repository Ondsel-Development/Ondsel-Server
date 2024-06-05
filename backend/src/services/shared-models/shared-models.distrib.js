import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import _ from 'lodash';
import {addSharedModelToFile, deleteSharedModelFromFile, updateSharedModelToFile} from "../file/file.distrib.js";
import {ProtectionType, VersionFollowType} from "./shared-models.subdocs.schema.js";

export const sharedModelsSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    isActive: Type.Boolean({default: true}),
    description: Type.String(),
    versionFollowing: VersionFollowType,
    protection: ProtectionType,
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.Any(),
    custFileName: Type.String(),
    createdAt: Type.Number(),
  },
)

export const copySharedModelBeforePatch = async (context) => {
    // store a copy of the Org in `context.beforePatchCopy` to help detect true changes
    const smService = context.app.service('shared-models');
    const smId = context.id;
    context.beforePatchCopy = await smService.get(smId);
    return context;
}

export function buildSharedModelSummary(sharedModel) {
    let summary = {};
    if (sharedModel) {
      summary = {
        _id: sharedModel._id,
        isActive: sharedModel.isActive,
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
