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
import {forDirectoryRemoveFileSummary, forDirectoryUpdateFileSummary} from "../directories/helpers.js";
import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {fileVersionSchema} from "./file.schema.js";

export function buildFileSummary(file) {
  let summary = {
    _id: file._id,
    custFileName: file.custFileName,
    modelId: file.modelId,
    currentVersion: file.currentVersion,
  };
  summary.thumbnailUrlCache = file.model?.thumbnailUrlCache || null;
  return summary;
}

//
// DISTRIBUTE AFTER (HOOK)
//

export const copyFileBeforePatch = async (context) => {
  // store a copy of the File in `context.beforePatchCopy` to help detect true changes
  const fileService = context.app.service('file');
  const fileId = context.id;
  context.beforePatchCopy = await fileService.get(fileId);
  return context;
}


export async function distributeFileSummaries(context){
  try {
    const fileId = context.id;
    if (fileId !== undefined) {
      const file = await context.app.service('file').get(fileId);
      let changeDetected = false;
      if (file.custFileName !== context.beforePatchCopy.custFileName) changeDetected = true;
      if (file.modelId !== undefined && context.beforePatchCopy.modelId !== undefined) {
        if (file.modelId.toString() !== context.beforePatchCopy.modelId.toString()) changeDetected = true;
      }
      if (file.currentVersion._id !== undefined && context.beforePatchCopy.currentVersion._id !== undefined) {
        if (file.currentVersion._id.toString() !== context.beforePatchCopy.currentVersion._id.toString()) changeDetected = true;
      }
      if (file.model?.thumbnailUrlCache !== context.beforePatchCopy.model?.thumbnailUrlCache) changeDetected = true;
      if (changeDetected) {
        const fileSummary = buildFileSummary(file);
        // to directories
        if (file.directory?._id) {
          await forDirectoryUpdateFileSummary(context, file.directory._id, fileSummary);
        };
      }
    };
  } catch (error) {
    console.log(error);
  }
  return context;
}

export async function distributeFileDeletion(context){
  // for now, this really only affects directories
  // this function is called post-delete, so the context.result already has content of "file"
  try {
    const file = context.result;
    if (file.directory?._id) {
      await forDirectoryRemoveFileSummary(context.app, file.directory._id, file._id);
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
