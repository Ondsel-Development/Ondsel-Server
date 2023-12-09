import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import {buildOrganizationSummary} from "./organizations.distrib.js";
import { getConstraint } from "../users/users.subdocs.schema.js";

export const isUserMemberOfOrganization = async context => {
  const organization = await context.service.get(context.id);

  if (organization.users.some(user => user._id.equals(context.params.user._id.toString()))) {
    return context;
  }
  throw new BadRequest({ type: 'PermissionError', msg: 'You are not a member of organization' });
}

export const isUserOwnerOrAdminOfOrganization = async context => {
  const organization = await context.service.get(context.id);

  // Only Owner or Admins of Org allow to add users
  if (
    context.params.user._id.equals(organization.createdBy)
    || organization.users.some(user => user._id.equals(context.params.user._id.toString()) && user.isAdmin)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}

export const canUserCreateOrganization = async context => {
  const { canCreateOrganization } = getConstraint(context.params.user);
  if (canCreateOrganization) {
    return context;
  }
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
