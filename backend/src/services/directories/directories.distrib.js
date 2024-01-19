// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.


//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

export function buildDirectorySummary(directory) {
  return {
    _id: directory._id,
    name: directory.name,
  };
}

//
// DISTRIBUTE AFTER (HOOK)
//


//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//             These routines are used by _other_ collections after creation/update/deletion
//

export async function updateWorkspaceSummaryToMatchingDirectories(context, wsSummary) {
  const directoryService = context.app.service('directories');
  const matchingDirectories = await directoryService.find({
    query: {
      "workspace._id": wsSummary._id
    }
  });
  for (const dir of matchingDirectories.data) {
    await updateWorkspaceSummaryToDirectory(context, dir._id, wsSummary);
  }
}

export async function updateWorkspaceSummaryToDirectory(context, dirId, wsSummary) {
  const directoryService = context.app.service('directories');
  await directoryService.patch(
    dirId,
    {
      workspace: wsSummary,
    }
  );
}