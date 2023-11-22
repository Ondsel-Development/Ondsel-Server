import _ from 'lodash';

import { buildGroupSummary } from '../../groups/groups.distrib.js';

export const addGroupsToOrganization = async (context) => {
  const { data } = context;
  const groupService = context.app.service('groups');

  const organization = await context.service.get(context.id);
  const organizationGroups = organization.groups || [];
  for (let groupId of data.groupIds) {
    if (!organizationGroups.some(group => group._id.toString() === groupId)){
      const group = await groupService.get(groupId);

      if (!organization._id.equals(group.organizationId)) {
        throw new BadRequest(`Group must be belong to same organization`)
      }
      organizationGroups.push(buildGroupSummary(group));
    }
  }
  data.groups = organizationGroups;
  context.data = _.omit(data, ['shouldAddGroupsToOrganization', 'groupIds']);
}
