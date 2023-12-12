import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import { buildGroupSummary } from '../../groups/groups.distrib.js';
import { buildWorkspaceSummary } from '../../workspaces/workspaces.distrib.js';


const isUserMemberofAnyOrganizationGroups = async (context, organization, user) => {
  const userMembersOfGroups = [];
  for (let groupSubDoc of organization.groups) {
    const group = await context.app.service('groups').get(groupSubDoc._id);
    if (group.users.some(u => u._id.equals(user._id))) {
      userMembersOfGroups.push(buildGroupSummary(group));
    }
  }
  return userMembersOfGroups;
}

const isUserMemberofAnyOrganizationWorkspaces = async (context, organization, user) => {
  const userMemberOfWorkspaces = [];
  const workspaces = await context.app.service('workspaces').find({ query: {organizationId: organization._id}, paginate: false});
  for (let workspace of workspaces) {
    if (workspace.groupsOrUsers.some(groupOrUser => groupOrUser.type === 'User' && groupOrUser.groupOrUser._id.equals(user._id))) {
      userMemberOfWorkspaces.push(buildWorkspaceSummary(workspace));
    }
  }
  return userMemberOfWorkspaces;
}

export const removeUsersFromOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  let organizationUsers = organization.users || [];
  for (let userId of data.userIds) {
    const user = await userService.get(userId);

    if (organization.owner._id.equals(user._id)) {
      throw new BadRequest({ type: 'PermissionError', msg: 'You cannot remove the owner from organization'});
    }

    const isUserMemberOfGroups = await isUserMemberofAnyOrganizationGroups(context, organization, user);
    const isUserMemberOfWorkspaces = await isUserMemberofAnyOrganizationWorkspaces(context, organization, user);

    if (isUserMemberOfGroups.length || isUserMemberOfWorkspaces.length) {
      throw new BadRequest('Restricted', {type: 'ValidationError', groups: isUserMemberOfGroups, workspaces: isUserMemberOfWorkspaces});
    }

    let userOrganizations = user.organizations;
    // First check is user exists
    if(organizationUsers.some(user => user._id.toString() === userId)) {
      organizationUsers = organizationUsers.filter(user => user._id.toString() !== userId);
      userOrganizations = userOrganizations.filter(org => !org._id.equals(organization._id));
      await userService.patch(user._id, { organizations: userOrganizations });
    }
  }
  data.users = organizationUsers;
  context.data = _.omit(data, ['shouldRemoveUsersFromOrganization', 'userIds']);
}
