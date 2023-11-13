import _ from 'lodash';

export const editGroupOrUserOnWorkspace = async (context) => {
  const { data } = context;

  const workspace = await context.service.get(context.id);
  let groupsOrUsersOfWorkspace = workspace.groupsOrUsers || [];
  const item = data.groupOrUserData;
  const groupOrUserId = item.groupOrUser._id;
  const index = groupsOrUsersOfWorkspace.findIndex( (detail) => detail.groupOrUser._id.toString() === groupOrUserId.toString() );
  if (index === -1) {
    throw new Error(`Cannot find ${groupOrUserId} in groupsOrUsers of workspace ${workspace._id}`);
  } else {
    groupsOrUsersOfWorkspace[index].permission = item.permission || groupsOrUsersOfWorkspace[index].permission;
    groupsOrUsersOfWorkspace[index].groupOrUser.name = item.groupOrUser.name || groupsOrUsersOfWorkspace[index].groupOrUser.name;
  }
  data.groupsOrUsers = groupsOrUsersOfWorkspace;
  context.data = _.omit(data, ['shouldEditGroupOrUserOnWorkspace', 'groupOrUserData']);
  return context;
}

