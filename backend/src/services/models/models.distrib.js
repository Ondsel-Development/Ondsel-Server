// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {applyModelSummaryToFile, applyThumbnailToFile} from "../file/file.distrib.js";

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection
//

export const modelSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    isObjGenerated: Type.Optional(Type.Boolean({default: false})),
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrlCache: Type.String(),
  }
)

export function buildModelSummary(model) {
  let summary = {};
  if (model) {
    summary._id = model._id;
    summary.createdAt = model.createdAt;
    summary.isObjGenerated = model.isObjGenerated;
    summary.isThumbnailGenerated = !!model.isThumbnailGenerated;
    summary.thumbnailUrlCache = model.thumbnailUrl; // when it finally generates, the model will compute it
  }
  return summary;
}

export async function getModelById(app, modelId) {
  const models = await app.service('models').find({
    query: {
      _id: modelId
    }
  });
  if (models.total === 0) {
    return null;
  }
  return models.data[0];
}

export async function getModelSummary(app, modelId) {
  let model = await getModelById(app, modelId);
  if (model === null) {
    return null;
  }
  return buildModelSummary(model);
}

//
// DISTRIBUTE AFTER (HOOK)
//

export const copyModelBeforePatch = async (context) => {
  // store a copy of the Model in `context.beforePatchCopy` to help detect true changes later
  const modelsService = context.app.service('models');
  const modelId = context.id;
  context.beforePatchCopy = await modelsService.get(modelId);
  return context;
}


export const distributeModelSummaries = async (context) => {
  const modelId = context.id;
  if (modelId !== undefined) {
    const model = await getModelById(context.app, modelId);
    if (model) { // might not get a value on a "soft delete" or "file delete", so don't do distribution
      const modelSummary = buildModelSummary(model);
      if (modelSummary !== null) {
        await applyModelSummaryToFile(context.app, model.fileId, modelSummary);
      }
    }
  }
  return context;
}

export const distributeModelThumbnails = async (context) => {
  // used for distributing file-version-specific copies of thumbnails to File when appropriate
  if (context.result.isSharedModel) { // this is only for the main model
    return context;
  }
  if (context.result.isObjGenerated === context.beforePatchCopy.isObjGenerated) { // only after file generation
    return context;
  }
  if (context.result.isObjGenerated === false) { // only when file generation finished
    return context;
  }
  await applyThumbnailToFile(context.app, context.id, context.result.fileId);
  return context;
}

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//


// export async function applyFileSummaryToModel() {}
