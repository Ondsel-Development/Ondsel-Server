import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import _ from 'lodash';
import {addSharedModelToFile, updateSharedModelToFile} from "../file/file.distrib.js";
import {VersionFollowType} from "./shared-models.subdocs.schema.js";

export const sharedModelsSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    versionFollowing: VersionFollowType,
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.String(),
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
        versionFollowing: sharedModel.versionFollowing,
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
