// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { buildUserSummary } from '../services/users/users.distrib.js';
import {buildOrganizationSummary} from "../services/organizations/organizations.distrib.js";

export async function updateFileRelatedUserDetailsCommand(app) {
  const fileService = app.service('file');
  const userService = app.service('users');
  let userCache = {};

  console.log('>>> getting all files');
  const fileList = await fileService.find({
    paginate: false,
  });
  console.log(`>>> files found: ${fileList.length}`);
  for (let file of fileList) {
    console.log(`  >>> Updating file ${file._id.toString()} - ${file.custFileName}`);
    try {
      let newUsers = [];
      console.log(`    >>> file versions found: ${file.versions.length}`);
      for (let ver of file.versions) {
        let sum = {}
        let userId = ver.userId.toString()
        console.log(`    >>> for user ${userId} in version`)
        if (userCache.hasOwnProperty(userId)) {
          console.log(`      >>> found cache entry`)
          sum = userCache[userId];
        } else {
          console.log(`      >>> Gathering summary for user ${userId}`);
          const user = await userService.get(userId);
          if (user) {
            sum = buildUserSummary(user);
            userCache[userId] = sum;
          }
        }
        newUsers.push(sum);
      }
      await fileService.patch(
        file._id.toString(),
        {
          relatedUserDetails: newUsers
        }
      )
      console.log('  >>> file update done.');
    } catch (e) {
      console.log(`  >>> ERROR in updating org ${file._id.toString()}`);
      console.log(e);
    }
  }
  console.log(`>>> command complete.`);
}