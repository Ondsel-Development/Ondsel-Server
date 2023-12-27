import { buildUserSummary } from '../services/users/users.distrib.js';
import {buildOrganizationSummary} from "../services/organizations/organizations.distrib.js";

export async function updateWorkspaceAndUserOrganizationInfoCommand(app) {
  const workspaceService = app.service('workspaces');
  const orgService = app.service('organizations');
  const userService = app.service('users');
  let orgCache = {};

  console.log('>>> getting all workspaces');
  const wsList = await workspaceService.find({
    paginate: false,
  });
  console.log(`>>> workspaces found: ${wsList.length}`);

  for (let ws of wsList) {
    console.log(`>>> Updating workspace ${ws._id.toString()} - ${ws.refName}`);
    try {
      const orgId = ws.organizationId.toString();
      let sum = {}
      if (orgCache.hasOwnProperty(orgId)) {
        console.log(`  >>> found cache for org ${orgId}`)
        sum = orgCache[orgId];
      } else {
        console.log(`  >>> Gathering summary for org ${orgId}`);
        const org = await orgService.get(orgId);
        sum = buildOrganizationSummary(org);
        orgCache[orgId] = sum;
      };
      console.log('  >>> using ' + JSON.stringify(sum));
      await workspaceService.patch(
        ws._id.toString(),
        {
          organization: sum,
        }
      );
    } catch (e) {
      console.log(`  >>> ERROR in updating workspace ${ws._id.toString()}`);
      console.log(e);
      continue;
    }
    console.log(`  >>> done.`);
  }
  console.log('>>> getting all users');
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>> users found: ${userList.length}`);
  for (let user of userList) {
    console.log(`  >>> Updating user ${user._id.toString()} - ${user.username}`);
    try {
      let newOrganizations = [];
      console.log(`    >>> user orgs found: ${user.organizations.length}`);
      for (let orgFound of user.organizations) {
        let sum = {}
        let orgId = orgFound._id.toString()
        console.log(`    >>> for org ${orgId}`)
        if (orgCache.hasOwnProperty(orgId)) {
          console.log(`      >>> found cache for org ${orgId}`)
          sum = orgCache[orgId];
        } else {
          console.log(`      >>> Gathering summary for org ${orgId}`);
          const org = await orgService.get(orgId);
          sum = buildOrganizationSummary(org);
          orgCache[orgId] = sum;
        };
        console.log('      >>> using ' + JSON.stringify(sum));
        newOrganizations.push(sum);
      }
      await userService.patch(
        user._id.toString(),
        {
          organizations: newOrganizations
        }
      )
    } catch (e) {
      console.log(`  >>> ERROR in updating user ${user._id.toString()}`);
      console.log(e);
    }
  }
  console.log(`>>> workspaces updated: ${wsList.length}`);
  console.log(`>>> users updated: ${userList.length}`);
  console.log(`>>> command complete.`);
}