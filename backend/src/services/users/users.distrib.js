// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {buildOrganizationSummary, upsertUserSummaryToOrganization} from "../organizations/organizations.distrib.js";
import {upsertUserSummaryToGroup} from "../groups/groups.distrib.js";

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

export function buildUserSummary(user) {
  let summary = {
    _id: user._id,
    username: user.username,
    name: user.name,
    tier: user.tier,
  };
  return summary;
}

//
// DISTRIBUTE AFTER (HOOK)
//

export const copyUserBeforePatch = async (context) => {
  // store a copy of the User in `context.beforePatchCopy` to help detect true changes
  const userService = context.app.service('users');
  const userId = context.id;
  context.beforePatchCopy = await userService.get(userId);
  return context;
}

export const distributeUserSummariesHook = async (context) => {
  let summaryChangeDetected = false;
  // _id and username cannot change. Ever. So just look at the other summary fields.
  if (context.beforePatchCopy.name !== context.result.name) {
    summaryChangeDetected = true;
  }
  if (context.beforePatchCopy.tier !== context.result.tier) {
    summaryChangeDetected = true;
  }
  if (summaryChangeDetected) {
    await distributeUserSummaries(context.app, context.result);
  }
  return context;
}

export async function distributeUserSummaries(app, user){
  // not a hook; but it is called by one (see above)
  // this does NOT verify that a change has been detected in the user summary; it blindly sends the summary.
  // returned log object is for use by migration commands

  const userSummary = buildUserSummary(user);
  let log = {}
  //
  // distribute to each organization's user list and the subtending groups
  //
  const orgService = app.service('organizations');
  for (const org of user.organizations) {
    await upsertUserSummaryToOrganization(orgService, org._id, userSummary);
  }
  log["organizations"] = user.organizations.length;

  //
  // distribute to groups containing this user
  //
  const groupService = app.service('groups');
  const relatedGroups = await groupService.find({
    paginate: false,
    query: {
      users: {
        $elemMatch: {
          username: user.username
        }
      }
    }
  });
  for (const group of relatedGroups) {
    await upsertUserSummaryToGroup(app, group._id.toString(), userSummary)
  }

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
