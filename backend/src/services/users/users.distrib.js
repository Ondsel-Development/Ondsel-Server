// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.

import {ObjectIdSchema, Type} from "@feathersjs/typebox";

//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

export function buildUserSummary(user) {
  let summary = {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
  };
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
