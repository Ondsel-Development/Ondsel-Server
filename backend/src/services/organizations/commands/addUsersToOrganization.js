import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';

export const addUsersToOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  const users = organization.users || [];
  for (let userId of data.userIds) {
    if (!users.some(user => user._id.toString() === userId)){
      let user = await userService.get(userId);
      if (!user.organizationId || user.organizationId === organization._id) {
        users.push({
          ..._.pick(user, ['_id', 'username', 'email', 'firstName', 'lastName']),
          isAdmin: false
        });
        await userService.patch(user._id, { organizationId: organization._id});
      } else {
        throw new BadRequest(`User (id: ${user._id.toString()}) already belonging to other organization.`)
      }
    }
  }
  data.users = users;
  context.data = _.omit(data, ['shouldAddUsersToOrganization', 'userIds']);
}
