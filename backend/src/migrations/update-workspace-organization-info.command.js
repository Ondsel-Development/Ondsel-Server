import { buildUserSummary } from '../services/users/users.distrib.js';
import {buildOrganizationSummary} from "../services/organizations/organizations.distrib.js";

export async function updateWorkspaceOrganizationInfoCommand(app) {
  const workspaceService = app.service('workspaces');
  const orgService = app.service('organizations');
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
      console.log(`  >>> Error in updating workspace ${ws._id.toString()}`);
      console.log(e);
      continue;
    }
    console.log(`  >>> done.`);
  }
  console.log(`>>> command complete.`);
}
