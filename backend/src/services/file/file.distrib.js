// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection
//

import {upsertOrganizationSummaryToUser} from "../users/users.distrib.js";
import {buildOrganizationSummary} from "../organizations/organizations.distrib.js";
import {forDirectoryUpdateFileSummary} from "../directories/helpers.js";
import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {fileVersionSchema} from "./file.schema.js";

export function buildFileSummary(file) {
  let cv = file.versions.find((ver) => ver._id.toString() === file.currentVersionId.toString());
  if (cv === undefined) {
    throw new Error(`unable to locate version ${file.currentVersionId} in file ${file._id}`)
  }
  let summary = {
    _id: file._id,
    custFileName: file.custFileName,
    modelId: file.modelId,
    currentVersion: {
      _id: file.currentVersionId,
      uniqueFileName: cv.uniqueFileName,
      userId: cv.userId,
      message: cv.message,
      createdAt: cv.createdAt,
      additionalData: {},
    },
  };
  if (cv.fileUpdatedAt) { // Optional not Null; so only add if actually there
    summary.currentVersion.fileUpdatedAt = cv.fileUpdatedAt;
  }
  summary.thumbnailUrlCache = file.model?.thumbnailUrlCache || null;
  return summary;
}

//
// DISTRIBUTE AFTER (HOOK)
//

export async function distributeFileSummaries(context){
  try {
    const fileId = context.id;
    if (fileId !== undefined) {
      const file = await context.app.service('file').get(fileId);
      // for now, we are assuming any change anywhere in file should trigger a summary distribution
      const fileSummary = buildFileSummary(file);
      // to directories
      if (file.directory?._id) {
        await forDirectoryUpdateFileSummary(context, file.directory._id, fileSummary);
      };
    };
  } catch (error) {
    console.log(error);
  }
  return context;
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
