// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

import { upsertGroupSummaryToOrganization } from '../organizations/organizations.distrib.js';
import {upsertGroupSummarytoWorkspaces} from "../workspaces/workspaces.distrib.js";

export function buildGroupSummary(group) {
  let summary = {};
  summary._id = group._id;
  summary.name = group.name;
  return summary;
}


//
// DISTRIBUTE AFTER (HOOK)
//

export const distributeGroupSummaries = async (context) => {
  // this function is for distributing changes from a PATCH
  try {
    const groupId = context.id;
    if (groupId !== undefined) {
      const summaryChangeSeen = context.data.name !== undefined; // this is the only field that will trigger right now
      if (summaryChangeSeen) {
        const group = await context.app.service('groups').get(groupId);
        const groupSummary = buildGroupSummary(group);
        // owning org has a copy of the group
        await upsertGroupSummaryToOrganization(context, group.organizationId, groupSummary);
        // each workspace belonging to the group has a copy of the group summary
        const workspaceList = group.workspaces || [];
        for (const workspace of workspaceList) {
          await upsertGroupSummarytoWorkspaces(context, workspace._id, groupSummary);
        }
      }
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

export async function upsertUserSummaryToGroup(app, groupId, userSummary) {
  try {
    const groupService = app.service('groups');
    const group = await groupService.get(groupId);
    let userList = group.users || [];
    const index = userList.findIndex((u) => u._id.toString() === userSummary._id.toString());
    if (index === -1) {
      userList.push(userSummary);
    } else {
      userList[index] = userSummary;
    }
    await groupService.patch(
      groupId,
      {
        users: userList,
      }
    );
  } catch (e) {
    console.log(`encountered error while distributing user sum to group ${groupId}`);
    console.log(e);
  }
}

export async function updateWorkspaceSummaryToMatchingGroups(context, wsSummary) {
  const groupService = context.app.service('groups');
  const matchingGroups = await groupService.find({
    query: {
      "workspaces._id": wsSummary._id // alternative is: workspaces: { $elemMatch: { _id: wsSummary._id } }
    }
  });
  for (const group of matchingGroups.data) {
    let newList = group.workspaces;
    newList.forEach((ws,index) => {
      if (ws._id.toString() === wsSummary._id.toString()) {
        newList[index] = wsSummary
      }
    })
    await groupService.patch(
      group._id,
      {
        workspaces: newList,
      }
    );
  }
}

export async function removeWorkspaceSummaryToMatchingGroups(context, wsId){
  const groupService = context.app.service('groups');
  const matchingGroups = await groupService.find({
    query: {
      "workspaces._id": wsId,
    }
  });
  const groupList = matchingGroups.data || [];
  for (const group of groupList) {
    let newList = group.workspaces.filter((ws) => !ws._id.equals(wsId));
    await groupService.patch(
      group._id,
      {
        workspaces: newList,
      }
    );
  }
}
