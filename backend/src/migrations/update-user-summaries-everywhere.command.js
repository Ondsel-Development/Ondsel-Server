// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {distributeUserSummaries} from "../services/users/users.distrib.js";

export async function updateUserSummariesEverywhereCommand(app) {
  const userService = app.service('users');
  const orgService = app.service('organizations');

  console.log('>>> Collecting list of all users');
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>> Users found: ${userList.length}`);

  for (let user of userList){
    console.log(`>>> Distribute user summary for (${user._id.toString()})`);
    try {
      const log = await distributeUserSummaries(app, user);
      const logMsg = JSON.stringify(log);
      console.log(`>>>   result: ${logMsg}`);
    } catch (e) {
      console.log(`>>> Error in updating user (${user._id.toString()}`);
      console.log(e);
    }
    console.log('\n');
  }
  console.log(`>>> done.`);
}
