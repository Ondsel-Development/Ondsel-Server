import { BadRequest } from '@feathersjs/errors';

export const canUserAccessDirectoryOrFileGetMethod = async context => {
  const directoryOrFile = await context.service.get(context.id);
  try {
    await context.app.service('workspaces').get(
      directoryOrFile.workspace._id,
      {
        user: context.params.user
      }
    )
  } catch (error) {
    throw new BadRequest({ type: 'PermissionError', msg: 'You dont have access to this directory or file'});
  }
  return context;
}


export const userBelongingDirectoriesOrFiles = async context => {
  // Get all user belonging workspaces
  const workspaces = await context.app.service('workspaces').find({
    query: { $select: ['_id'] },
    user: context.params.user,
    paginate: false
  });

  context.params.query['workspace._id'] = {
    $in: workspaces.map(f => f._id)
  }
  return context;
}


export const canUserAccessDirectoryOrFilePatchMethod = async context => {
  const directory = await context.service.get(context.id);
  try {
    const workspace = await context.app.service('workspaces').get(
      directory.workspace._id,
      {
        user: context.params.user
      }
    )
    if (workspace.haveWriteAccess) {
      return context;
    }
  } catch (error) {
    throw new BadRequest({ type: 'PermissionError', msg: 'You dont have access to this directory or file'});
  }
  throw new BadRequest({ type: 'PermissionError', msg: 'You dont have write access to this directory or file'});
}


export async function forDirectoryUpdateFileSummary(context, dirId, fileSummary) {
  // limited patch designed to not spin up a summary-update loop; often stored in *.distrib.js file
  const directoryService = context.app.service('directories');
  const dir = await directoryService.get(dirId);
  let fileList = dir.files || [];
  const index = fileList.findIndex(file => file._id.equals(fileSummary._id));
  if (index === -1) {
    fileList.push(fileSummary);
  } else {
    fileList[index] = fileSummary;
  }
  await directoryService.patch(
    dirId,
    {
      files: fileList,
    },
    {
      authentication: context.params.authentication,
    }
  );
}

export const isDirectoryReadyToDelete = async context => {
  const directory = await context.service.get(context.id);
  //
  // Ensure this organization is not a root directory
  //
  if (directory.name === "/") {
    throw new BadRequest('You cannot delete the root directory.');
  }
  //
  // Ensure there are no files or subdirectories.
  //
  const fileCount = directory.files.length;
  const dirCount = directory.directories.length;
  if ( (fileCount > 0) || (dirCount > 0) ) {
    throw new BadRequest(`Deletion error. There are ${fileCount} files and ${dirCount} sub-directories remaining in the directory. The directory must be empty.`);
  }
  //
  return context;
}

export async function forDirectoryRemoveFileSummary(app, dirId, fileId) {
  // limited patch designed to not spin up a summary-update loop; often stored in *.distrib.js file
  const directoryService = app.service('directories');
  const dir = await directoryService.get(dirId);
  const fileList = dir.files || [];
  const newFileList = fileList.filter((fileEntry) => fileEntry._id.toString() !== fileId.toString());
  await directoryService.patch(
    dirId,
    {
      files: newFileList,
    }
  );
}
