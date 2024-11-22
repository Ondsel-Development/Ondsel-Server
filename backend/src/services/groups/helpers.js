// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { BadRequest } from '@feathersjs/errors';

export const isUserOwnerOrAdminOfOrganization = async context => {

  const provider = context.params.provider; // Internal calls are "undefined"
  if (provider === undefined) {
    return context;
  }

  const group = await context.service.get(context.id);
  const organization = await context.app.service('organizations').get(group.organizationId);

  // Only Owner or Admins of Org allow to add users
  if (
    context.params.user._id.equals(organization.createdBy)
    || organization.users.some(user => user._id.equals(context.params.user._id.toString()) && user.isAdmin)) {
    return context;
  }
  throw new BadRequest('Only admins of organization allow to perform this action');
}
