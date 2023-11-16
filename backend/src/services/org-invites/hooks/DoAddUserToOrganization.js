import {BadRequest} from "@feathersjs/errors";
import _ from "lodash";
import { orgInviteStateTypeMap } from "../org-invites.subdocs.schema.js";

export const doAddUserToOrganization = async (context) => {
  // skip if not actually adding a user
  if (context.data.state !== orgInviteStateTypeMap.verifyOrgInviteEmail) {
    return context;
  }
  //
  // GET ORIGINAL invite; do NOT trust the put details
  //
  const invite = await context.app.service('org-invites').get(context.data._id);
  if (!invite) {
    throw new BadRequest(`Invalid: cannot find original invite.`);
  }
  context.dbref.invite = invite;
  //
  // GET User
  //
  const userId = context.data.result.userId;
  const user = await context.app.service('users').get(userId);
  if (!user) {
    throw new BadRequest(`Invalid: cannot find user ${userId} from result object`);
  }
  context.dbref.user = user; // this is a hack for confirmation email later. "userDetail" is not part of the schema
  //
  // GET Org
  //
  const orgService = context.app.service('organizations');
  const org = context.dbref.organization;
  //
  // Add them to the org.
  //
  const newUser = {
    ..._.pick(user, ['_id', 'username', 'name']),
    isAdmin: false
  };
  org.users.push(newUser);
  await orgService.patch(
    org._id,
    {
      users: org.users
    }
  );
  //
  return context;
}
