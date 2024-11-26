// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import {buildUserSummary} from "../../users/users.distrib.js";

export const addUsersToGroup = async context => {
  const { data } = context;
  const userService = context.app.service('users');

  const group = await context.service.get(context.id);
  const groupUsers = group.users || [];
  for (let userId of data.userIds) {
    if (!groupUsers.some(user => user._id.toString() === userId.toString())){
      const user = await userService.get(userId);
      const userOrganizations = user.organizations || [];
      if (!userOrganizations.some(org => group.organizationId.equals(org._id))) {
        throw new BadRequest(`User (id: ${userId}) must be a member to this group organization`)
      }
      groupUsers.push(
        buildUserSummary(user)
      );
    }
  }
  data.users = groupUsers;
  context.data = _.omit(data, ['shouldAddUsersToGroup', 'userIds']);
}
