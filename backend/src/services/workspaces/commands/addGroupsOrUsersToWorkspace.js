import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import {buildWorkspaceSummary} from "../workspaces.distrib.js";

export const addGroupsOrUsersToWorkspace = async context => {
  const { data } = context;
  const groupService = context.app.service('groups');
  const userService = context.app.service('users');

  const workspace = await context.service.get(context.id);
  let groupsOrUsersOfWorkspace = workspace.groupsOrUsers || [];
  for (let [type, permission, groupOrUserId] of data.groupsOrUsersData) {
    if (!groupsOrUsersOfWorkspace.some(groupOrUser => groupOrUser.type === type && groupOrUser.groupOrUser._id.toString() === groupOrUserId)){
      if (type === 'Group') {
        const group = await groupService.get(groupOrUserId);
        if (!workspace.organizationId.equals(group.organizationId)) {
          throw new BadRequest(`Group (id: ${group._id.toString()}) must be belong to same organization`)
        }
        groupsOrUsersOfWorkspace.push({
          type,
          permission,
          groupOrUser: _.pick(group, ['_id', 'name']),
        });
        await upsertWorkspaceIntoGroup(groupService, workspace, group);
      } else if (type === 'User') {
        const user = await userService.get(groupOrUserId);
        const userOrganizations = user.organizations || [];
        if (!userOrganizations.some(organizationSummary => organizationSummary._id.equals(workspace.organizationId))) {
          throw new BadRequest(`User (id: ${user._id.toString()}) must be belong to same organization`)
        }
        groupsOrUsersOfWorkspace.push({
          type,
          permission,
          groupOrUser: _.pick(user, ['_id', 'username', 'email', 'firstName', 'lastName']),
        });
      } else {
        throw new BadRequest('Type must be either Group or User');
      }
    } else {
      // if item already present then update type and permission
      groupsOrUsersOfWorkspace = groupsOrUsersOfWorkspace.map(groupOrUser => groupOrUser.groupOrUser._id.toString() === groupOrUserId ? { ...groupOrUser, permission, type } : groupOrUser)
    }
  }
  data.groupsOrUsers = groupsOrUsersOfWorkspace;
  context.data = _.omit(data, ['shouldAddGroupsOrUsersToWorkspace', 'groupsOrUsersData']);
  return context;
}

const upsertWorkspaceIntoGroup = async(groupService, workspace, group) => {
  let workspaceList = group.workspaces || [];
  let workspaceSummary = buildWorkspaceSummary(workspace);
  const index = workspaceList.findIndex( (detail) => detail._id === workspace._id );
  if (index === -1) {
    workspaceList.push(workspaceSummary);
  } else {
    workspaceList[index] = workspaceSummary;
  }
  await groupService.patch(
    group._id,
    {
      workspaces: workspaceList
    }
  );
};
