// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection
//

// export const fileSummarySchema = Type.Object(
//   {
//     _id: ObjectIdSchema(),
//   }
// )

// export function buildFileSummary(file) {
//   let summary = {};
//   return summary;
// }

// export async function getFileSummary(app, fileId) {
//   const files = await app.service('files').find({
//     query: {
//       _id: fileId
//     }
//   });
//   if (files.total === 0) {
//     return {}
//   }
//   return buildFileSummary(files[0]);
// }

//
// DISTRIBUTE AFTER (HOOK)
//

export async function distributeFileSummaries(context, file){
  // file summaries are not distributed yet.
}

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//

export async function applyModelSummaryToFile(app, fileId, modelSummary) {
  await app.service('file').patch(
    fileId,
    {
      model: modelSummary,
    }
  );
}
