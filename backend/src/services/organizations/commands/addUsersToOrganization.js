import _ from 'lodash';

export const addUsersToOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  const organizationUsers = organization.users || [];
  for (let userId of data.userIds) {
    if (!organizationUsers.some(user => user._id.toString() === userId)){
      const user = await userService.get(userId);
      const userOrganizations = user.organizations || [];

      organizationUsers.push({
        ..._.pick(user, ['_id', 'username', 'email', 'firstName', 'lastName']),
        isAdmin: false
      });
      if (!userOrganizations.some(org => {org._id.equals(organization._id)})) {
        userOrganizations.push(_.pick(organization, ['_id', 'name']));
        await userService.patch(user._id, { organizations: userOrganizations});
      }
    }
  }
  data.users = organizationUsers;
  context.data = _.omit(data, ['shouldAddUsersToOrganization', 'userIds']);
}
