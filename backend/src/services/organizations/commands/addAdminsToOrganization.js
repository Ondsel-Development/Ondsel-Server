import _ from 'lodash';

export const addAdminsToOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  const admins = organization.admins || [];
  for (let userId of data.userIds) {
    if (!admins.some(user => user._id.toString() === userId)){
      let user = await userService.get(userId);
      admins.push(_.pick(user, ['_id', 'username', 'email', 'firstName', 'lastName']));
    }
  }
  data.admins = admins;
  context.data = _.omit(data, ['shouldAddAdminsToOrganization', 'userIds']);
}
