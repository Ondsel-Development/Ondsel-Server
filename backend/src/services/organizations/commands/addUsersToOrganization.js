import _ from 'lodash';
import {buildOrganizationSummary, upsertGroupSummaryToOrganization} from "../organizations.distrib.js";
import {buildGroupSummary} from "../../groups/groups.distrib.js";
import {buildUserSummary} from "../../users/users.distrib.js";

export const addUsersToOrganization = async (context) => {
  const { data } = context;
  const userService = context.app.service('users');

  const organization = await context.service.get(context.id);
  const organizationUsers = organization.users || [];
  for (let userId of data.userIds) {
    if (!organizationUsers.some(user => user._id.toString() === userId)){
      const user = await userService.get(userId);
      const userOrganizations = user.organizations || [];

      const userSum = buildUserSummary(user);
      organizationUsers.push({
        ...userSum,
        isAdmin: false
      });
      if (!userOrganizations.some(org => {org._id.equals(organization._id)})) {
        userOrganizations.push(buildOrganizationSummary(organization));
        await userService.patch(user._id, { organizations: userOrganizations});
        await addUserToDefaultingGroups(context, organization, user);
      }
    }
  }
  data.users = organizationUsers;
  context.data = _.omit(data, ['shouldAddUsersToOrganization', 'userIds']);
}

const addUserToDefaultingGroups = async (context, organization, user) => {
  try {
    const userSummary = buildUserSummary(user);
    const groupService = context.app.service('groups');
    for (const groupSum of organization.groups) {
      const group = await groupService.get(groupSum._id);
      if (group.takeAllNewUsers === true) {
        await groupService.patch(
          groupSum._id,
          {
            shouldAddUsersToGroup: true,
            userIds: [user._id],
          }
        )
      }
    }
  } catch (error) {
    console.log(error);
  }
}
