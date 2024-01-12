import { buildUserSummary } from '../services/users/users.distrib.js';
import {buildOrganizationSummary} from "../services/organizations/organizations.distrib.js";

export async function updateGroupUsersCommand(app) {
  const groupService = app.service('groups');
  const userService = app.service('users');
  let userCache = {};

  console.log('>>> getting all groups');
  const groupList = await groupService.find({
    paginate: false,
  });
  console.log(`>>> groups found: ${groupList.length}`);
  for (let group of groupList) {
    console.log(`  >>> Updating group ${group._id.toString()} - ${group.name}`);
    try {
      let newUsers = [];
      console.log(`    >>> group users found: ${group.users.length}`);
      for (let userSummary of group.users) {
        let newSum = {}
        let userId = userSummary._id.toString()
        console.log(`    >>> for user ${userSummary.username} ${userId}`)
        if (userCache.hasOwnProperty(userId)) {
          console.log(`      >>> found cache entry`)
          newSum = userCache[userId];
        } else {
          console.log(`      >>> Gathering summary for user ${userId}`);
          const user = await userService.get(userId);
          newSum = buildUserSummary(user);
          userCache[userId] = newSum;
        };
        newUsers.push(newSum);
      }
      await groupService.patch(
        group._id.toString(),
        {
          users: newUsers
        }
      )
    } catch (e) {
      console.log(`  >>> ERROR in updating org ${group._id.toString()}`);
      console.log(e);
    }
  }
  console.log(`>>> command complete.`);
}