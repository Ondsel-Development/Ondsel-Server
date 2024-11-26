// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { buildUserSummary } from '../services/users/users.distrib.js';

export async function updateWorkspaceUsersCommand(app) {
  const workspaceService = app.service('workspaces');
  const userService = app.service('users');
  const db = await workspaceService.options.Model;
  let userCache = {};

  console.log('>>> Collecting workspaces');
  const workspaces = await workspaceService.find({
    paginate: false,
  });
  console.log(`>>> Workspace found: ${workspaces.length}`);
  for (let workspace of workspaces) {
    console.log(`>>> Updating workspace (${workspace._id.toString()})`);
    const groupsOrUsers = [];
    for (let gou of workspace.groupsOrUsers) {
      if ( gou.type === 'User' ) {
        let userSum = {};
        let userId = gou.groupOrUser._id.toString();
        if (userCache.hasOwnProperty(userId)) {
          console.log(`  >>> found user cache entry`)
          userSum = userCache[userId];
        } else {
          console.log(`  >>> Gathering summary for user ${userId}`);
          const user = await userService.get(userId);
          userSum = buildUserSummary(user);
          userCache[userId] = userSum;
        };
        groupsOrUsers.push({
          ...gou,
          groupOrUser: userSum,
        });
      } else {
        groupsOrUsers.push(gou);
      }
    }
    await db.updateOne({ _id: workspace._id }, { $set: { groupsOrUsers: groupsOrUsers } });
    console.log(`  >>> update done.`);
  }
  console.log(`>>> command complete.`);
}

