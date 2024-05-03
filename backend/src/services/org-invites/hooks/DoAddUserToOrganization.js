import {BadRequest} from "@feathersjs/errors";
import _ from "lodash";
import { orgInviteStateTypeMap } from "../org-invites.subdocs.schema.js";

export const doAddUserToOrganization = async (context) => {
  // skip if not actually adding a user
  if (context.data.state !== orgInviteStateTypeMap.verifyOrgInviteEmail) {
    return context;
  }
  if (!context.data.result) {
    context.data.result = {}
  }
  //
  // verify passedTokenConfirmation matches
  //
  if (context.data.inviteToken) {
    throw new BadRequest('Invalid: inviteToken cannot be changed');
  }
  if (context.data.passedTokenConfirmation !== context.dbref.invite.inviteToken) {
    throw new BadRequest('Invalid: passedTokenConfirmation does not match');
  }
  //
  // GET Logged-In User
  //
  const user = context.params.user;
  context.dbref.user = user; // this is a hack for confirmation email later. "userDetail" is not part of the schema
  //
  // GET Org
  //
  const orgService = context.app.service('organizations');
  const org = context.dbref.organization; // should be set by getOrgDetail hook earlier in org-invites.js
  //
  // Exit if already belonging
  //
  if (org.users.some(u => u._id.toString() === user._id.toString())) { // skip if already added
    context.data.result.log = `WARNING: consumed but user ${user._id} already part of org`;
    return context;
  } else {
    if (!context.data.result.note) {
      context.data.result.userId = user._id;
      context.data.result.log = `user ${user._id} added to org`;
    }
  }
  //
  // Add them to the org.
  //
  await orgService.patch(
    org._id,
    {
      shouldAddUsersToOrganization: true,
      userIds: [user._id.toString()],
    }
  );
  //
  return context;
}
