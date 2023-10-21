import _ from 'lodash';

export const removeGroupsFromWorkspace = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const group = await context.service.get(context.id);
  let groupUsers = group.users || [];
  for (let userId of data.userIds) {
    if(groupUsers.some(user => user._id.toString() === userId)) {
      groupUsers = groupUsers.filter(user => user._id.toString() !== userId);
    }
  }
  data.users = groupUsers;
  context.data = _.omit(data, ['shouldRemoveUsersFromGroup', 'userIds']);
}
