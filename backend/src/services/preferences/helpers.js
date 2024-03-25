import {BadRequest} from "@feathersjs/errors";
import { isUserOwnerOrAdminOfOrg } from '../organizations/helpers.js';


export const validateAndFeedPayload = async context => {

  // validate
  if (!context.data.organizationId) {
    throw new BadRequest('organizationId is mandatory');
  }
  if (!context.data.version) {
    throw new BadRequest('version object is mandatory');
  }

  const organizationService = context.app.service('organizations');
  const organization = await organizationService.get(context.data.organizationId);

  if (organization.preferencesId) {
    throw new BadRequest('preferences object already initiated to organization, do patch');
  }

  const canUserAddPrefToOrg = isUserOwnerOrAdminOfOrg(organization, context.params.user);

  console.log(organization, canUserAddPrefToOrg)

};