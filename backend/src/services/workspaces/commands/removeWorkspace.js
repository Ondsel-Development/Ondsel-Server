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
  const ws = await workspaceService.get(wsId);
  //
  // verify
  //
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
    await directoryService.remove(ws.rootDirectory._id, {$removeRoot: true, ...context.params});
  } else {
    throw new BadRequest('Invalid: workspace not ready for deletion', {
      errors: { reason: checkResult }
    })
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
    return `${directory.files.length} files found; workspace must be empty`;
  }
  if (directory.directories.length > 0) {
    return `${directory.directories.length} directories found; workspace must be empty`;
  }
  return true;
}
