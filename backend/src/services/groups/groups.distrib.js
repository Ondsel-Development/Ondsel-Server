// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

import {upsertOrganizationSummaryToUser} from "../users/users.distrib.js";
import {buildOrganizationSummary, upsertGroupSummaryToOrganization} from "../organizations/organizations.distrib.js";

export function buildGroupSummary(group) {
  let summary = {};
  summary._id = group._id;
  summary.name = group.name;
  return summary;
}


//
// DISTRIBUTE AFTER (HOOK)
//

// nothing

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//             These routines are used by _other_ collections after creation/update/deletion
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
        for (const workspace in group.workspaces) {
          // TODO: await upsertGroupSummarytoWorkspaces(context, workspace._id, groupSummary);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  return context;
}
