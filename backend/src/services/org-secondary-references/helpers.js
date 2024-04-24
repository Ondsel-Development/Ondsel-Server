import {isUserMemberOfOrg, isUserOwnerOrAdminOfOrg} from '../organizations/helpers.js';
import { BadRequest } from '@feathersjs/errors';


export const canUserPatchOrgSecondaryReferences = async context => {
  const orgSecondaryReferences = await context.service.get(context.id);
  const organization = await context.app.service('organizations').get(orgSecondaryReferences.organizationId);
  if (isUserOwnerOrAdminOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}


export const canUserGetOrgSecondaryReferences = async context => {
  const orgSecondaryReferences = await context.service.get(context.id);
  const organization = await context.app.service('organizations').get(orgSecondaryReferences.organizationId);
  if (isUserMemberOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest('Only members of organization allow to perform this action');
}

export const limitOrgSecondaryReferencesToUser = async context => {
  const { user } = context.params;
  const organizations = user.organizations || [];
  context.params.query['organizationId'] = {
    $in: organizations.map(org => org._id)
  };
  return context;
}