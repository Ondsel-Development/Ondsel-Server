// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection
//

import {forDirectoryRemoveFileSummary, forDirectoryUpdateFileSummary} from "../directories/helpers.js";
import {VersionFollowType, VersionFollowTypeMap} from "../shared-models/shared-models.subdocs.schema.js";

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
      if (file.modelId !== undefined && !file.modelId.equals(context.beforePatchCopy.modelId)) {
        changeDetected = true;
      }
      if (file.currentVersion._id !== undefined && !file.currentVersion._id.equals(context.beforePatchCopy.currentVersion._id)) {
        changeDetected = true;
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
  const fileService = app.service('file');
  const fDb = await fileService.options.Model;

  await fDb.updateOne(
    { _id: fileId },
    {
      $set: {
        model: modelSummary,
      },
    },
  )
}

export async function applyThumbnailToFile(app, modelId, fileId) {
  const fileService = app.service('file');
  const fDb = await fileService.options.Model;

  try {
    const currentFile = await fDb.findOne({ _id: fileId });
    if (currentFile) {
      const currentVersionId = currentFile.versions.at(-1)._id;
      // first attempt to duplicate the file
      const uploadService = app.service('upload');
      const fromUrl = `public/${modelId.toString()}_thumbnail.PNG`;
      const toUrl = `public/${modelId.toString()}_${currentVersionId.toString()}_versionthumbnail.PNG`;
      await uploadService.upsert(fromUrl, toUrl);
      const finalUrlObj = await uploadService.get(toUrl);
      const finalUrl = finalUrlObj?.url;
      // now save in the File document
      if (finalUrl) {
        const result = await fDb.updateOne(
          { _id: fileId },
          {
            $set: {
              "versions.$[ver].thumbnailUrlCache": finalUrl,
            },
          },
          {
            arrayFilters: [
              {"ver._id": currentVersionId}
            ]
          }
        )
        if (result.matchedCount !== 1) {
          console.log(`ERROR: failed to modify File ${fileId.toString()} version ${currentVersionId.toString()} with thumbnail`);
        }
      } else {
        console.log(`Failed to get/generate url of thumbnail file ${toUrl}.`);
      }
      // console.log(finalUrl);
      // console.log(currentVersionId);
      // console.log("did it");
    } else {
      console.log(`THUMBNAIL DIST PROBLEM: unable to locate file ${fileId}`)
    }
  } catch (e) {
    console.log(e);
  }
}

export async function updateWorkspaceSummaryToMatchingFiles(context, wsSummary) {
  const fileService = context.app.service('file');
  const matchingFiles = await fileService.find({
    query: {
      "workspace._id": wsSummary._id
    }
  });
  for (const file of matchingFiles.data) {
    await updateWorkspaceSummaryToFile(context, file._id, wsSummary);
  }
}

export async function updateWorkspaceSummaryToFile(context, fileId, wsSummary) {
  const fileService = context.app.service('file');
  await fileService.patch(
    fileId,
    {
      workspace: wsSummary,
    }
  );
}

export async function addSharedModelToFile(app, fileDetail, sharedModelSummary) {
  const fileService = app.service('file');
  const fileDb = await fileService.options.Model;
  switch (sharedModelSummary.versionFollowing) {
  case VersionFollowTypeMap.active:
    await fileDb.updateOne(
      { _id: fileDetail.fileId },
      {
        $push: {followingActiveSharedModels: sharedModelSummary},
      }
    );
    break;
  case VersionFollowTypeMap.locked:
    await fileDb.updateOne(
      { _id: fileDetail.fileId },
      {
        $push : {
          "versions.$[ver].lockedSharedModels": sharedModelSummary,
        },
      },
      {
        arrayFilters: [
          {"ver._id": fileDetail.versionId}
        ]
      }
    );
    break;
  }
}

export async function updateSharedModelToFile(app, fileDetail, limitedSharedModelSummary){
  // the summary is limited in that only the 'description' field is relevant
  const fileService = app.service('file');
  const fileDb = await fileService.options.Model;
  switch (limitedSharedModelSummary.versionFollowing) {
  case VersionFollowTypeMap.active:
    await fileDb.updateOne(
      { _id: fileDetail.fileId },
      {
        $set: {
          "followingActiveSharedModels.$[entry].description": limitedSharedModelSummary.description,
          "followingActiveSharedModels.$[entry].isActive": limitedSharedModelSummary.isActive,
        }
      },
      {
        arrayFilters: [
          {"entry._id": limitedSharedModelSummary._id},
        ]
      }
    );
    break;
  case VersionFollowTypeMap.locked:
    await fileDb.updateOne(
      { _id: fileDetail.fileId },
      {
        $set: {
          "versions.$[ver].lockedSharedModels.$[entry].description": limitedSharedModelSummary.description,
          "versions.$[ver].lockedSharedModels.$[entry].isActive": limitedSharedModelSummary.isActive,
        }
      },
      {
        arrayFilters: [
          {"ver._id": fileDetail.versionId},
          {"entry._id": limitedSharedModelSummary._id},
        ]
      }
    );
    break;
  }
}

export async function deleteSharedModelFromFile(app, sharedModel) {
  const fileService = app.service('file');
  const fileDb = await fileService.options.Model;
  switch (sharedModel.versionFollowing) {
    case VersionFollowTypeMap.active:
      await fileDb.updateOne(
        { _id: sharedModel.fileDetail.fileId },
        {
          $pull: {
            followingActiveSharedModels: { _id: sharedModel._id }
          }
        },
      );
      break;
    case VersionFollowTypeMap.locked:
      await fileDb.updateOne(
        { _id: sharedModel.fileDetail.fileId },
        {
          $pull: {
            "versions.$[ver].lockedSharedModels": { _id: sharedModel._id }
          }
        },
        {
          arrayFilters: [
            {"ver._id": sharedModel.fileDetail.versionId},
          ]
        }
      );
      break;
  }
}
