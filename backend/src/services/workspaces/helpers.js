import _ from 'lodash';
import {buildWorkspaceSummary} from "./workspaces.distrib.js";
import {BadRequest} from "@feathersjs/errors";

export const isUserBelongsToWorkspace = async context => {
  if (context.params.user) {
    const userOrganizations = context.params.user.organizations || []

    if (context.params.query.organizationId) {
      if (userOrganizations.find(org => org._id.equals(context.params.query.organizationId))) {
        return context;
      }
      throw new BadRequest('You are not the member of this organization');
    }

    context.params.query.organizationId = {
      $in: userOrganizations.map(org => org._id)
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
