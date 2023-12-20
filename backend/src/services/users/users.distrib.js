// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {buildOrganizationSummary, upsertUserSummaryToOrganization} from "../organizations/organizations.distrib.js";

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

export function buildUserSummary(user) {
  let summary = {
    _id: user._id,
    username: user.username,
    name: user.name,
  };
  return summary;
}

//
// DISTRIBUTE AFTER (HOOK)
//

export async function distributeUserSummaries(context, user){
  // not a hook; but a hook could certainly call it
  // this does NOT verify that a change has been detected in the user summary; it blindly sends the summary.
  // if this function where to be added to a `patch` hook later, then that hook would need to detect change to prevent
  // distributed update loops.

  const userSummary = buildUserSummary(user);
  let log = {}
  //
  // distribute to each organization's user list
  //
  for (const org of user.organizations) {
    await upsertUserSummaryToOrganization(context, org._id, userSummary);
  }
  log["organizations"] = user.organizations.length;

  // TODO: distribute to related group's users list.
  // TODO: distribute to related workspace's groupOrUserList.
  return log;
}

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//             These routines are used by _other_ collections after creation/update/deletion
//

export async function upsertOrganizationSummaryToUser(context, userId, orgSummary) {
  const userService = context.app.service('users');
  const user = await userService.get(userId);
  let orgList = user.organizations || [];
  const index = orgList.findIndex((o) => o._id.toString() === orgSummary._id.toString());
  if (index === -1) {
    orgList.push(orgSummary);
  } else {
    orgList[index] = orgSummary;
  }
  await userService.patch(
    userId,
    {
      organizations: orgList,
    }
  );
}
