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


export async function forDirectoryUpdateFileSummary(context, dirId, fileSummary) {
  // limited patch designed to not spin up a summary-update loop; often stored in *.distrib.js file
  const directoryService = context.app.service('directories');
  const dir = await directoryService.get(dirId);
  let fileList = dir.files || [];
  const index = fileList.findIndex(file => file._id.equals(fileSummary._id));
  if (index === -1) {
    fileList.push(fileSummary);
  } else {
    fileList[index] = fileSummary;
  }
  await directoryService.patch(
    dirId,
    {
      files: fileList,
    },
    {
      authentication: context.params.authentication,
    }
  );
}