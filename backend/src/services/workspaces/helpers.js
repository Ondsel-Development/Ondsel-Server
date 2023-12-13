import _ from 'lodash';
import {buildWorkspaceSummary} from "./workspaces.distrib.js";
import {BadRequest} from "@feathersjs/errors";


export const isUserBelongsToWorkspace = async context => {
  if (context.params.user) {
    // if user is owner of organization, then allow workspace
    if (context.method === 'get') {
      const workspace = await context.service.get(context.id);
      const workspaceOrg = await context.app.service('organizations').get(workspace.organizationId);
      if (workspaceOrg.users.some(user => user._id.equals(context.params.user._id) && user.isAdmin )) {
        return context
      }
    }

    const userOrganizations = context.params.user.organizations || []
    let orgArgs = {};
    if (context.params.query.organizationId) {
      if (!userOrganizations.find(org => org._id.equals(context.params.query.organizationId))) {
        throw new BadRequest('You are not the member of this organization');
      }
      // if user is the owner of org, then return all organization workspaces
      const org = await context.app.service('organizations').get(context.params.query.organizationId);
      if (org.users.some(user => user._id.equals(context.params.user._id) && user.isAdmin )) {
        return context;
      }
      orgArgs = { organizationId: context.params.query.organizationId };
    }

    // Collect all groups, where user is the member of group
    const groups = await context.app.service('groups').find({
      paginate: false,
      pipeline: [{
        $match: {
          ...orgArgs,
          users: {
            $elemMatch: {
              _id: context.params.user._id
            }
          }
        }
      }]
    });

    // query to filter all workspaces where user is the member of workspace directly or through group.
    context.params.query.groupsOrUsers = {
      $elemMatch: {
        $or: [
          {
            type: 'User',
            'groupOrUser._id': context.params.user._id,
          },
          {
            type: 'Group',
            'groupOrUser._id': {
              $in: groups.map(group => group._id)
            }
          }
        ]
      }
    }
  }
  return context;
}

export const createAndAssignRootDirectory = async context => {
  const directory = await context.app.service('directories').create(
    {
      name: '/',
      workspace: buildWorkspaceSummary(context.result)
    }, { user: context.params.user }
  );
  context.result = await context.service.patch(
    context.result._id,
    { rootDirectory: _.pick(directory, ['_id', 'name'])},
  )
  return context;
}
