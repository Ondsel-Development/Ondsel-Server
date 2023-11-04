import _ from 'lodash';

export const removeGroupsOrUsersFromWorkspace = async (context) => {
  const { data } = context;

  const workspace = await context.service.get(context.id);
  let groupsOrUsersOfWorkspace = workspace.groupsOrUsers || [];
  for (let groupOrUserId of data.groupsOrUsersIds) {
    groupsOrUsersOfWorkspace = groupsOrUsersOfWorkspace.filter(groupOrUserData => groupOrUserData.groupOrUser._id.toString() !== groupOrUserId)
  }
  data.groupsOrUsers = groupsOrUsersOfWorkspace;
  context.data = _.omit(data, ['shouldRemoveGroupsOrUsersFromWorkspace', 'groupsOrUsersIds']);
  return context;
}
