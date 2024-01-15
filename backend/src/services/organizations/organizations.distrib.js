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
import {updateOrganizationSummaryToMatchingWorkspaces} from "../workspaces/workspaces.distrib.js";

export function buildOrganizationSummary(org) {
  let summary = {};
  summary._id = org._id;
  summary.name = org.name;
  summary.refName = org.refName;
  summary.type = org.type;
  return summary;
}

//
// DISTRIBUTE AFTER (HOOK)
//

export const copyOrgBeforePatch = async (context) => {
  // store a copy of the Org in `context.beforePatchCopy` to help detect true changes
  const organizationService = context.app.service('organizations');
  const orgId = context.id;
  context.beforePatchCopy = await organizationService.get(orgId);
  return context;
}

export const distributeOrganizationSummaries = async (context) => {
  // this function is for distributing changes from a PATCH
  try {
    const orgId = context.id;
    if (orgId !== undefined) {
      let summaryChangeSeen = false;
      // `_id`, `refName`, and `type` cannot change. Ever. So just look at the other summary fields.
      if (context.beforePatchCopy.name !== context.result.name) {
        summaryChangeSeen = true;
      }
      if (summaryChangeSeen) {
        const orgSummary = buildOrganizationSummary(context.result);
        //
        // update Users
        //
        for (const userSummary of context.result.users) {
          await upsertOrganizationSummaryToUser(context, userSummary._id, orgSummary);
        }
        //
        // update Workspaces
        //
        await updateOrganizationSummaryToMatchingWorkspaces(context, orgSummary);
        //
        // don't update OrgInvites. The org summary is a historical record of the invite and should not be updated
        //
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
  try {
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
  } catch(e) {
    console.log(`encountered error while distributing group sum to org ${orgId}`);
    console.log(e);
  }
}

export async function upsertUserSummaryToOrganization(orgService, orgId, userSummary) {
  try {
    const org = await orgService.get(orgId);
    let userList = org.users || [];
    const index = userList.findIndex(user => user._id.equals(userSummary._id));
    let userData = {...userSummary}; // make a field copy
    if (index === -1) {
      userData.isAdmin = false; // in this scenario, presume false as this is a cleanup algo
      userList.push(userData);
    } else {
      userData.isAdmin = userList[index].isAdmin;
      userList[index] = userData;
    }
    let patchContent = {
      users: userList,
    }
    if (org.owner._id.toString() === userSummary._id.toString()) {
      patchContent.owner = userSummary;
    }
    await orgService.patch(
      orgId.toString(),
      patchContent,
    );
  } catch(e) {
    console.log(`encountered error while distributing user sum to org ${orgId}`);
    console.log(e);
  }
}

