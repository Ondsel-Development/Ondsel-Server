export const userReadAccessDirectories = async context => {
  const userOrganizations = context.params.user.organizations || [];
  const workspaces = await context.app.service('workspaces').find({
    organizationId: { '$in': userOrganizations.map(org => org._id) },
    paginate: false
  });
  context.params.query['workspace._id'] = {
    '$in': workspaces.map(workspace => workspace._id)
  };
  return context;
}

const haveUserWriteAccess = async (context, workspace, userId) => {
  for (let groupOrUser of workspace.groupsOrUsers) {
    if (groupOrUser.type === 'User') {
      if (groupOrUser.permission === 'write' && groupOrUser.groupOrUser._id.equals(userId)) {
        return true;
      }
    } else {
      if (groupOrUser.permission === 'write') {
        const group = await context.app.service('groups').get(groupOrUser._id);
        return group.users.some(user => user._id.equals(userId));
      }
    }
  }
  return false;
}

export const userWriteAccessDirectories = async context => {
  const userOrganizations = context.params.user.organizations || [];
  const workspaces = await context.app.service('workspaces').find({
    organizationId: { '$in': userOrganizations.map(org => org._id) },
    paginate: false
  });
  const workspacesUpdateAccess = [];
  for (let workspace of workspaces){
    const haveAccess = await haveUserWriteAccess(context, workspace, context.params.user._id);
    if (haveAccess) {
      workspacesUpdateAccess.push(workspace._id);
    }
  }
  context.params.query['workspace._id'] = {
    '$in': workspacesUpdateAccess
  }
  return context;
}