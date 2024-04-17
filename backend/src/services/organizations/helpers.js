import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import {buildOrganizationSummary} from "./organizations.distrib.js";
import { getConstraint } from "../users/users.subdocs.schema.js";
import {OrganizationType, OrganizationTypeMap} from "./organizations.subdocs.schema.js";


export const isUserMemberOfOrg = (organization, user) => {

  const userList = organization.users || [];
  return userList.some(orgUser => orgUser._id.equals(user._id.toString()));
};

export const isUserMemberOfOrganization = async context => {
  // this is called from after/get; so result has the org (if found)
  if (context.publicDataOnly) {
    return context; // not private, all is good
  }
  let organization = context.result;
  if (!organization) {
    return context; // no result, all is good
  }

  if (isUserMemberOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest({ type: 'PermissionError', msg: 'You must be a member of organization to get private information' });
}

export const isUserOwnerOrAdminOfOrg = (organization, user) => {

  // Only Owner or Admins of Org allow to add users
  return (
    user._id.equals(organization.owner._id)
    || organization.users.some(u => u._id.equals(user._id.toString()) && u.isAdmin)
  );
}

export const isUserOwnerOrAdminOfOrganization = async context => {
  const organization = await context.service.get(context.id);

  // Only Owner or Admins of Org allow to add users
  if (isUserOwnerOrAdminOfOrg(organization, context.params.user)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}

export const isUserOwnerOfOrganization = async context => {
  const organization = await context.service.get(context.id);

  // Only Owner
  if (context.params.user._id.toString() === organization.owner._id.toString() ) {
    return context;
  }
  throw new BadRequest('Only the key owner of organization allow to perform this action');
}

export const canUserCreateOrganization = async context => {
  const { canCreateOpenOrganization, canCreatePrivateOrganization } = getConstraint(context.params.user);
  if (canCreatePrivateOrganization && context.data.type === OrganizationTypeMap.private) {
    return context;
  }
  if (canCreateOpenOrganization && context.data.type === OrganizationTypeMap.open) {
    return context;
  }
  // note: user cannot ever "create" a new personal organization.
  throw new BadRequest(`User doesn't have enough permissions to create a organization`);
}

export const assignOrganizationIdToUser = async context => {
  const userService = context.app.service('users');
  const user = await userService.get(context.params.user._id);
  const userOrganizations = user.organizations || [];
  userOrganizations.push(buildOrganizationSummary(context.result));

  await context.app.service('users').patch(context.result.createdBy, { organizations: userOrganizations });
  return context;
}


export const limitOrgranizationsToUser = async context => {
  const { user } = context.params;
  const organizations = user.organizations || [];
  context.params.query['_id'] = {
    $in: organizations.map(org => org._id)
  };
  return context;
}