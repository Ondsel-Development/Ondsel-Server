import { BadRequest } from '@feathersjs/errors';
import {buildUserSummary} from "../users/users.distrib.js";
import {buildDirectorySummary} from "./directories.distrib.js";

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

export const doesUserHaveWorkspaceWriteRights = async context => {
  // used 'before' a 'create'
  const workspace = await context.app.service('workspaces').get(
    context.data.workspace._id,
    {
      user: context.params.user
    }
  )
  if (workspace.haveWriteAccess) {
    return context;
  }
  throw new BadRequest({ type: 'PermissionError', msg: 'You dont have write access to this workspace'});
}

export const verifyDirectoryUniqueness = async context => {
  // used 'before' a 'create'
  if (context.data.name === "/" && !context.data.parentDirectory) {
    return context;  // root is always unique
  }
  const pDir = await context.service.get(context.data.parentDirectory._id);
  const siblings = pDir.directories || [];
  const twin = siblings.find((d) => d.name === context.data.name);
  if (twin) {
    throw new BadRequest(`A directory by the same name (${context.data.name}) already exists`);
  }
  return context;
}

export const attachNewDirectoryToParent = async context => {
  // used 'after' a 'create'
  // by the time this is called, the correctness of insertion (rights, uniqueness, etc.) has been verified
  const childDir = context.result;
  const parentDir = await context.service.get(childDir.parentDirectory._id);
  let directories = parentDir.directories || [];
  directories.push(buildDirectorySummary(childDir));
  await context.service.patch(
    parentDir._id,
    {
      directories: directories,
    }
  )
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

export const handleAddRelatedUserDetailsQuery = () => {
  return async (context, next) => {
    // this is an "around" hook
    // looks for the "addRelatedUserDetails" query parameter. If found at all and set to "true", then
    // context.addRelatedUserDetails is set to true else it is set to false.
    // the 'addRelatedUserDetails' entry is then removed from query to prevent the parameter from being seen elsewhere.
    if (context.params?.query?.addRelatedUserDetails === "true") {
      delete context.params.query.addRelatedUserDetails;
      context.addRelatedUserDetails = true
    } else {
      if (context.params?.query?.addRelatedUserDetails) { // if anything but "true"; still clean up
        delete context.params.query.addRelatedUserDetails;
      }
      context.addRelatedUserDetails = false
    }
    await next();
    return context;
  }
}

export const ifNeededAddRelatedUserDetails = async context => {
  if (context.addRelatedUserDetails) {
    const userService = context.app.service('users');
    let relatedUserDetails = [];
    let directory = context.result;
    for (const file of directory.files) {
      let userId = file.currentVersion.userId.toString();
      if (relatedUserDetails.find((user) => user._id.toString() === userId) === undefined) {
        try {
          const user = await userService.get(userId);
          if (user) {
            const newSum = buildUserSummary(user);
            relatedUserDetails.push(newSum);
          }
        } catch (e) {
          console.log(`Error: could not get user details for ${userId}`);
        }
      }
    }
    context.result.relatedUserDetails = relatedUserDetails;
  }
  return context;
}
