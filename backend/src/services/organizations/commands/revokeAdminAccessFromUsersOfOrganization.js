import _ from 'lodash';

export const revokeAdminAccessFromUsersOfOrganization = async (context) => {
  const { data } = context;
  const { users } = await context.service.get(context.id);

  users.map(user => {
    if (data.userIds.includes(user._id.toString())) {
      user.isAdmin = false;
    }
  })

  data.users = users;
  context.data = _.omit(data, ['shouldRevokeAdminAccessFromUsersOfOrganization', 'userIds']);
  return context;
}