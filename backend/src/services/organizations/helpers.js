import { BadRequest } from '@feathersjs/errors';

export const isUserMemberOfOrganization = async context => {
  const organization = await context.service.get(context.id);

  // Only Owner or Admins of Org allow to add users
  if (organization.users.some(user => user._id.equals(context.params.user._id.toString()))) {
    return context;
  }
  throw new BadRequest('You are not a member of organization');
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
  const { user } = context.params;
  if (user.organizationId) {
    throw new BadRequest(`You cannot create organization because you already a part of organization (id: ${user.organizationId.toString()})`);
  }
  return context;
}

export const assignOrganizationIdToUser = async context => {
  await context.app.service('users').patch(context.result.createdBy, { organizationId: context.result._id })
  return context;
}
