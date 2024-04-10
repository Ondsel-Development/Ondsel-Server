import { isUserOwnerOrAdminOfOrg } from '../organizations/helpers.js';
import { BadRequest } from '@feathersjs/errors';


export const canUserPatchOrgSecondaryReferences = async context => {
  const orgSecondaryReferences = await context.service.get(context.id);
  const organization = await context.app.service('organizations').get(orgSecondaryReferences.organizationId);
  if (isUserOwnerOrAdminOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}
