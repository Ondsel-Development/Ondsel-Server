import _ from 'lodash';

export const removeUsersFromOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  let organizationUsers = organization.users || [];
  for (let userId of data.userIds) {
    const user = await userService.get(userId);
    let userOrganizations = user.organizations;
    // First check is user exists
    if(organizationUsers.some(user => user._id.toString() === userId)) {
      organizationUsers = organizationUsers.filter(user => user._id.toString() !== userId);
      userOrganizations = userOrganizations.filter(org => !org._id.equals(organization._id));
      await userService.patch(user._id, { organizations: userOrganizations });
    }
  }
  data.users = organizationUsers;
  context.data = _.omit(data, ['shouldRemoveUsersFromOrganization', 'userIds']);
}
