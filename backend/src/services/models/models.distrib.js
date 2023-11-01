// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {applyModelSummaryToFile} from "../file/file.distrib.js";
import {hasDocumentChangedSummary} from "../../summary_support.js";

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

// These are the fields to monitor for changes from the _root_ document to be placed into a summary for distribution.
// This list CANNOT contain any fields from a summary. And, they must be from the root of the document.
export const modelChangeFieldsForSummary = ['createdAt', 'isObjGenerated', 'isThumbnailGenerated', 'thumbnailUrl'];

export function buildModelSummary(model) {
  let summary = {};
  if (model) {
    summary._id = model._id;
    summary.createdAt = model.createdAt;
    summary.isObjGenerated = model.isObjGenerated;
    summary.isThumbnailGenerated = model.isThumbnailGenerated;
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

export const distributeModelSummaries = async (context) => {
  try {
    if (hasDocumentChangedSummary(context, 'models', modelChangeFieldsForSummary)) {
      // normally, the following line would work, but we are pulling thumbnailUrl virtually
      // const modelSummary = buildModelSummary(context.result);
      const modelSummary = await getModelSummary(context.app, context.id);
      await applyModelSummaryToFile(context.app, context.result.fileId, modelSummary);
    }
  } catch(error) {
    console.log(error);
  }
  return context;
}

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//


// export async function applyFileSummaryToModel() {}
