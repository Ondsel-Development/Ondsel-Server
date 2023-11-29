// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

export function buildWorkspaceSummary(workspace) {
  return {
    _id: workspace._id,
    name: workspace.name,
    refName: workspace.refName,
  };
}

//
// DISTRIBUTE AFTER (HOOK)
//

// nothing

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//             These routines are used by _other_ collections after creation/update/deletion
//

export async function upsertGroupSummarytoWorkspaces(context, workspaceId, groupSummary) {
  const workspaceService = context.app.service('workspaces');
  const groupId = groupSummary._id;
  const workspace = await workspaceService.get(workspaceId);
  let guList = workspace.groupsOrUsers || [];
  const matchingGroup = (detail) => ( (detail.groupOrUser._id.toString() === groupId.toString()) && (detail.type === 'Group') );
  const index = guList.findIndex(matchingGroup);
  if (index === -1) {
    console.log(`Error: when distributing summary from group ${groupId}, workspace ${workspaceId} was missing item in groupsOrUsers field.`);
  } else {
    await workspaceService.patch(
      workspaceId,
      {
        shouldEditGroupOrUserOnWorkspace: true,
        groupOrUserData: { groupOrUser: groupSummary }
      }
    );
  }
}
