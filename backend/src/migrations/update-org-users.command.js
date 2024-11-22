// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { buildUserSummary } from '../services/users/users.distrib.js';
import {buildOrganizationSummary} from "../services/organizations/organizations.distrib.js";

export async function updateOrgUsersCommand(app) {
  const orgService = app.service('organizations');
  const userService = app.service('users');
  let userCache = {};

  console.log('>>> getting all orgs');
  const orgList = await orgService.find({
    paginate: false,
  });
  console.log(`>>> orgs found: ${orgList.length}`);
  for (let org of orgList) {
    console.log(`  >>> Updating org ${org._id.toString()} - ${org.refName}`);
    try {
      let newUsers = [];
      console.log(`    >>> org users found: ${org.users.length}`);
      for (let userDataFound of org.users) {
        let sum = {}
        let userId = userDataFound._id.toString()
        console.log(`    >>> for user ${userDataFound.username} ${userId}`)
        if (userCache.hasOwnProperty(userId)) {
          console.log(`      >>> found cache entry`)
          sum = userCache[userId];
        } else {
          console.log(`      >>> Gathering summary for user ${userId}`);
          const user = await userService.get(userId);
          sum = buildUserSummary(user);
          userCache[userId] = sum;
        };
        sum.isAdmin = userDataFound.isAdmin ?? false;
        console.log('      >>> using ' + JSON.stringify(sum));
        newUsers.push(sum);
      }
      await orgService.patch(
        org._id.toString(),
        {
          users: newUsers
        }
      )
    } catch (e) {
      console.log(`  >>> ERROR in updating org ${org._id.toString()}`);
      console.log(e);
    }
  }
  console.log(`>>> command complete.`);
}