import _ from 'lodash';

export const removeUsersFromOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  let users = organization.users || [];
  for (let userId of data.userIds) {
    // First check is user exists
    if(users.some(user => user._id.toString() === userId)) {
      users = users.filter(user => user._id.toString() !== userId);
      await userService.patch(userId, { organizationId: null })
    }
  }
  data.users = users;
  context.data = _.omit(data, ['shouldRemoveUsersFromOrganization', 'userIds']);
}
