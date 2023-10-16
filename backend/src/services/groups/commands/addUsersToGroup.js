import _ from 'lodash';

export const addUsersToGroup = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const group = await context.service.get(context.id);
  const groupUsers = group.users || [];
  for (let userId of data.userIds) {
    if (!groupUsers.some(user => user._id.toString() === userId)){
      const user = await userService.get(userId);
      groupUsers.push(
        _.pick(user, ['_id', 'username', 'email', 'firstName', 'lastName'])
      );
    }
  }
  data.users = groupUsers;
  context.data = _.omit(data, ['shouldAddUsersToGroup', 'userIds']);
}
