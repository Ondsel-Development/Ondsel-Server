// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {BadRequest} from "@feathersjs/errors";

// remove the workspace via soft delete if ready
export const removeWorkspace = async context => {
  //
  // prep
  //
  const { data } = context;
  const workspaceService = context.app.service('workspaces');
  const directoryService = context.app.service('directories');
  const wsId = context.id;
  const ws = await workspaceService.get(wsId, { authentication: context.params.authentication });
  //
  // verify
  //
  if (context.params.user && !ws.haveWriteAccess) {
    throw new BadRequest({type: 'PermissionError', msg: 'You do not have write access to delete the workspace'})
  }
  let checkResult = true;
  if (ws.deleted === true) {
    checkResult = "cannot remove a deleted workspace"
  } else {
    const dir = await directoryService.get(ws.rootDirectory._id);
    checkResult = verifyEmptyWorkspace(ws, dir);
  }

  let newWsDoc = {}
  if (checkResult === true) {
    //
    // do the soft delete
    //
    let desc = `(DELETED, former refName=${ws.refName}) ${ws.description}`;
    let deletedAt = Date.now();
    let deletedBy = context.params.user?._id || undefined; // if not set, then a migration script probably did the deletion
    // delete the directory first as it does as workspace GET that would fail after marking workspace deleted
    await directoryService.remove(ws.rootDirectory._id, {$removeRoot: true, ...context.params});
    newWsDoc = context.data = await workspaceService.patch(
      wsId,
      {
        refName: '<REDACTED>',
        refNameHash: 0,
        description: desc,
        curation: undefined,
        deleted: true,
        deletedAt: deletedAt,
        deletedBy: deletedBy,
      }
    )
  } else {
    throw new BadRequest(`Cannot delete: ${checkResult}`)
  }
  //
  // done; return results
  //
  context.beforeRemoveCopy = ws; // used later for distribution
  context.result = newWsDoc;
  return context;
}

function verifyEmptyWorkspace(workspace, directory) {
  if (!directory) {
    const dirId = workspace.rootDirectory._id;
    return `unable to get root directory ${dirId} of workspace`
  }
  if (directory.files.length > 0) {
    return `${directory.files.length} files found and workspace must be empty`;
  }
  if (directory.directories.length > 0) {
    return `${directory.directories.length} directories found and workspace must be empty`;
  }
  return true;
}
