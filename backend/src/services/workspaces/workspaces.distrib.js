// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

import {workspace} from "./workspaces.js";

export function buildWorkspaceSummary(workspace) {
  return {
    _id: workspace._id,
    name: workspace.name,
    refName: workspace.refName,
    open: workspace.open,
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

export async function updateOrganizationSummaryToMatchingWorkspaces(context, orgSummary) {
  const workspaceService = context.app.service('workspaces');
  const matchingWorkspaces = await workspaceService.find({
    query: {
      organizationId: orgSummary._id,
    }
  });
  for (const ws of matchingWorkspaces.data) {
    await updateOrganizationSummaryToWorkspace(context, ws._id, orgSummary);
  }
}

export async function updateOrganizationSummaryToWorkspace(context, workspaceId, orgSummary) {
  const workspaceService = context.app.service('workspaces');
  await workspaceService.patch(
    workspaceId,
    {
      organization: orgSummary,
    }
  );
}

export async function updateUserSummaryToWorkspace(app, workspaceId, userSummary) {
  try {
    const workspaceService = app.service('workspaces');
    const workspace = await workspaceService.get(workspaceId);
    let groupsOrUsersList = workspace.groupsOrUsers || [];
    const index = groupsOrUsersList.findIndex((u) => (u.type === 'User') && (u.groupOrUser._id.toString() === userSummary._id.toString()));
    if (index === -1) {
      console.log(`Error: when distributing summary from user ${userSummary._id}, workspace ${workspaceId} was missing item in groupsOrUsers field.`);
    } else {
      await workspaceService.patch(
        workspaceId,
        {
          shouldEditGroupOrUserOnWorkspace: true,
          groupOrUserData: { groupOrUser: userSummary }
        }
      );
    }
  } catch (e) {
    console.log(`encountered error while distributing user sum to workspace ${workspaceId}`);
    console.log(e);
  }
}