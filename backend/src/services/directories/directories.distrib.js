// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.


//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//


//
// DISTRIBUTE AFTER (HOOK)
//

export async function distributeDirectoryDeletion(context){
  // for now, this really only affects the parent directory
  // this function is called post-delete, so the context.result already has content of "file"
  try {
    const refDir = context.result;
    // remove self from parent directory
    if (refDir.parentDirectory) {
      const parentId = refDir.parentDirectory._id;
      await forDirectoryRemoveSubDirectory(context.app, parentId, refDir._id)
    } else {
      console.log(`ERROR: parent directory missing when deleting directory ${refDir._id}.`)
    }
  } catch (error) {
    console.log(error);
  }
  return context;
}


//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//             These routines are used by _other_ collections after creation/update/deletion
//

export async function forDirectoryRemoveSubDirectory(app, dirId, subDirId) {
  // limited patch designed to not spin up a summary-update loop
  const directoryService = app.service('directories');
  const dir = await directoryService.get(dirId);
  const subDirList = dir.directories || [];
  const newSubDirList = subDirList.filter((dirEntry) => dirEntry._id.toString() !== subDirId.toString());
  await directoryService.patch(
    dirId,
    {
      directories: newSubDirList,
    }
  );
}