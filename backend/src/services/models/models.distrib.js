// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {applyModelSummaryToFile} from "../file/file.distrib.js";

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection
//

export const modelSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    objUrl: Type.String(),
    thumbnailUrl: Type.String(),
  }
)

export function buildModelSummary(model) {
  let summary = {};
  if (model) {
    summary._id = model._id;
    summary.createdAt = model.createdAt;
    summary.objUrl = model.objUrl;
    summary.thumbnailUrl = model.thumbnailUrl;
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

export const distributeModelSummaries = async (context) => {
  const modelId = context.id;
  if (modelId !== undefined) {
    const model = await getModelById(context.app, modelId);
    const modelSummary = buildModelSummary(model);
    if (modelSummary !== null) {
      await applyModelSummaryToFile(context.app, model.fileId, modelSummary);
    }
  }
  return context;
}

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//


// export async function applyFileSummaryToModel() {}
