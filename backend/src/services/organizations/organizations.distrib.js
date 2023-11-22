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

export function buildOrganizationSummary(org) {
  let summary = {};
  summary._id = org._id;
  summary.name = org.name;
  return summary;
}

//
// DISTRIBUTE AFTER (HOOK)
//

export const distributeOrganizationSummaries = async (context) => {
  // this function is for distributing changes from a PATCH
  try {
    const orgId = context.id;
    if (orgId !== undefined) {
      const org = await context.app.service('organizations').get(orgId);
      const summaryChangeSeen = context.data.name !== undefined; // this is the only field that will trigger right now
      if (summaryChangeSeen) {
        const orgSummary = buildOrganizationSummary(org);
        // the users have a summary of the org
        for (const userSummary of org.users) {
          await upsertOrganizationSummaryToUser(context, userSummary._id, orgSummary);
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

export async function upsertGroupSummaryToOrganization(context, orgId, groupSummary) {
  const orgService = context.app.service('organizations');
  const org = await orgService.get(orgId);
  let groupList = org.groups || [];
  const index = groupList.findIndex(group => group._id.equals(groupSummary._id));
  if (index === -1) {
    groupList.push(groupSummary);
  } else {
    groupList[index] = groupSummary;
  }
  await orgService.patch(
    orgId,
    {
      groups: groupList,
    },
    {
      authentication: context.params.authentication,
    }
  );
}
