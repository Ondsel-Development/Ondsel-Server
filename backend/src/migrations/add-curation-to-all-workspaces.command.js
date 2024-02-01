import {buildWorkspaceSummary} from "../services/workspaces/workspaces.distrib.js";
import {buildUserSummary} from "../services/users/users.distrib.js";
import {OrganizationTypeMap} from "../services/organizations/organizations.subdocs.schema.js";
import {SubscriptionTypeMap} from "../services/users/users.subdocs.schema.js";
import {buildNewCurationForWorkspace} from "../services/workspaces/workspaces.curation.js";

const overwriteAnywayWithNull = false;

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
    if (ws.curation && overwriteAnywayWithNull === false) {
      console.log(`  >>> ws ${ws.refName} ${ws._id} is GOOD already`)
    } else {
      let newCuration = buildNewCurationForWorkspace(ws);
      if (overwriteAnywayWithNull) {
        newCuration = null
      }
      await workspaceService.patch(
        ws._id,
        {
          curation: newCuration,
        }
      );
      console.log(`  >>> ws ${ws.refName} ${ws._id} UPDATED`)
    }
    // pause to prevent async overwrite conflicts in mongo
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`>>> command complete.`);
}