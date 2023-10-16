import _ from 'lodash';

export const addUsersOrGroupsToWorkspace = async context => {
  const { data } = context;
  const groupService = context.app.service('groups');
  const userService = context.app.service('users');

  const workspace = await context.service.get(context.id);
  const groupsOrUsersOfWorkspace = workspace.groupsOrUsers || [];
  for (let groupId of data.groupIds) {
    if (!groupsOrUsersOfWorkspace.some(groupOrUser => groupOrUser.type === 'Group' && groupOrUser.groupOrUser._id.toString() === groupId)){
      const group = await groupService.get(groupId);
      groupsOrUsersOfWorkspace.push({
        type: 'Group',
        permission: 'read',
        groupOrUser: _.pick(group, ['_id', 'name']),
      });
    }
  }
  data.groupsOrUsers = groupsOrUsersOfWorkspace;
  context.data = _.omit(data, ['shouldAddUsersToGroup', 'userIds']);
}
