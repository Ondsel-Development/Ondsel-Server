import _ from 'lodash';
import {BadRequest} from "@feathersjs/errors";

export const revokeAdminAccessFromUsersOfOrganization = async (context) => {
  const { data } = context;
  const { owner, users } = await context.service.get(context.id);

  users.map(user => {
    if (data.userIds.includes(user._id.toString())) {
      if (user._id.equals(owner._id)) {
        throw new BadRequest({ type: 'PermissionError', msg: 'You cannot remove owner from admin access'});
      }
      user.isAdmin = false;
    }
  })

  data.users = users;
  context.data = _.omit(data, ['shouldRevokeAdminAccessFromUsersOfOrganization', 'userIds']);
  return context;
}