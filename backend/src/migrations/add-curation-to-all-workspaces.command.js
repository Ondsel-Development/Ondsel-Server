import {buildWorkspaceSummary} from "../services/workspaces/workspaces.distrib.js";
import {buildUserSummary} from "../services/users/users.distrib.js";
import {OrganizationTypeMap} from "../services/organizations/organizations.subdocs.schema.js";
import {SubscriptionTypeMap} from "../services/users/users.subdocs.schema.js";
import {buildNewCurationForWorkspace} from "../services/workspaces/workspaces.curation.js";

export async function addCurationToAllWorkspacesCommand(app) {
  // bluntly update directories, files, and groups with new Workspace summary
  // update workspaces to `open` field if missing
  const workspaceService = app.service('workspaces');

  console.log('>>> getting all workspaces');
  const wsList = await workspaceService.find({
    paginate: false,
  });
  console.log(`>>> workspaces found: ${wsList.length}`);
  for (const ws of wsList) {
    if (ws.curation) {
      console.log(`  >>> ws ${ws.refName} ${ws._id} is GOOD already`)
    } else {
      const newCuration = buildNewCurationForWorkspace(ws);
      await workspaceService.patch(
        ws._id.toString(),
        {
          curation: newCuration,
        }
      );
      console.log(`  >>> ws ${ws.refName} ${ws._id} UPDATED`)
    }
  }

  console.log(`>>> command complete.`);
}