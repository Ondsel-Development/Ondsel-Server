import _ from 'lodash';

export const removeGroupsOrUsersFromWorkspace = async (context) => {
  const { data } = context;
  const groupService = context.app.service('groups');

  const workspace = await context.service.get(context.id);
  let groupsOrUsersOfWorkspace = workspace.groupsOrUsers || [];
  for (let groupOrUserId of data.groupsOrUsersIds) {
    if (!groupsOrUsersOfWorkspace.some(groupOrUser => groupOrUser.type === 'Group' && groupOrUser.groupOrUser._id.toString() === groupOrUserId)) {
      await deleteWorkspaceFromGroup(groupService, workspace._id, groupOrUserId);
    }
    groupsOrUsersOfWorkspace = groupsOrUsersOfWorkspace.filter(groupOrUserData => groupOrUserData.groupOrUser._id.toString() !== groupOrUserId)
  }
  data.groupsOrUsers = groupsOrUsersOfWorkspace;
  context.data = _.omit(data, ['shouldRemoveGroupsOrUsersFromWorkspace', 'groupsOrUsersIds']);
  return context;
}

const deleteWorkspaceFromGroup = async(groupService, workspaceId, groupId) => {
  try {
    const group = await groupService.get(groupId);
    let workspaceList = group.workspaces || [];
    workspaceList = workspaceList.filter( (detail) => detail._id !== workspaceId );
    await groupService.patch(
      group._id,
      {
        workspaces: workspaceList
      }
    );
  } catch(error) {
    console.log(error);
  }
};
