// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { buildWorkspaceSummary } from '../services/workspaces/workspaces.distrib.js';

export async function updateDirectoryWorkspaceSubDocs(app) {
  const directoryService = app.service('directories');
  const workspaceService = app.service('workspaces');
  const db = await workspaceService.options.Model;

  console.log('>>> Collecting directories where workspace.refName not exists');
  const directories = await directoryService.find({
    paginate: false,
    pipeline: [{
      $match: {
        'workspace.refName': { $exists: false }
      }
    }]
  });
  console.log(`>>> Directories found: ${directories.length}`);
  for (let directory of directories) {
    console.log(`>>> Updating directory (${directory._id.toString()})`);
    try {
      const workspace = await workspaceService.get(directory.workspace._id);
      await directoryService.patch(
        directory._id,
        {
          workspace: buildWorkspaceSummary(workspace)
        }
      )
    } catch (e) {
      console.log(`>>> Error in updating directory (${directory._id.toString()}`);
      console.log(e);
      continue;
    }
    console.log(`>>> Successfully updated directory (${directory._id.toString()})`);
  }
}

