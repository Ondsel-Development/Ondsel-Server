import _ from 'lodash';
import {BadRequest} from "@feathersjs/errors";
import {buildWorkspaceSummary} from "../workspaces/workspaces.distrib.js";
import {buildUserSummary} from "../users/users.distrib.js";

export const feedWorkspaceAndDirectory = async context => {
  const { data, params } = context;

  if (data.isSystemGenerated) {
    return context;
  }

  if (!data.workspace || !data.directory) {
    let defaultWorkspaceId = params.user.defaultWorkspaceId;
    if (!defaultWorkspaceId) {
      // Safe check
      const userService = context.app.service('users');
      const user = await userService.get(params.user._id);
      if (!user.defaultWorkspaceId) {
        throw new BadRequest('Either mention workspace and directory in request payload, or set defaultWorkspaceId.');
      }
      defaultWorkspaceId = user.defaultWorkspaceId;
    }
    const workspace = await context.app.service('workspaces').get(defaultWorkspaceId);
    data.workspace = buildWorkspaceSummary(workspace);
    data.directory = workspace.rootDirectory;
    context.data = data;
  }
  return context;
}


export const addFileToDirectory = async context => {
  const directorySerivce = context.app.service('directories');
  if (context.result.directory) {
    await directorySerivce.patch(
      context.result.directory._id,
      {
        shouldAddFilesToDirectory: true,
        fileIds: [context.result._id.toString()],
      }
    )
  return context;
  }
}

export async function buildRelatedUserDetails(context, file) {
  // this function will examine the file revisions and relatedUserDetails and will return an
  // array of user summaries with exactly one entry per userId.
  // if a user is not found, it should silently refrain from adding an entry to the list.
  const userService = context.app.service('users');
  let cleanUserDetails = [];
  let oldDetails = file.relatedUserDetails || [];
  for (const version of file.versions) {
    if (cleanUserDetails.includes((user) => user._id === version.userId) === false) {
      let newSum = oldDetails.find((user) => user._id === version.userId)
      if (!newSum) {
        try {
          let user = await userService.get(version.userId);
          newSum = buildUserSummary(user);
        } catch (e) {
          console.log(`Error: could not get user details for ${version.userId}`);
        }
      }
      if (newSum) {
        cleanUserDetails.push(newSum);
      }
    }
  }
  return cleanUserDetails;
}

export const ensureUniqueCustFileName = async context => {
  // this is called BEFORE a `create` or `patch` is called to ensure the filename is unique in the
  // directory context. If it is not unique, then operation is blocked with a BadRequest.
  const directoryService = context.app.service('directories');
  const file = context.data;
  const proposedCustFileName = file.custFileName;
  if (context.id) {
    // if context.id, then this is a patch/put
    const currentFileContent = await context.service.get(context.id);
    if (proposedCustFileName) {
      if (currentFileContent.custFileName !== proposedCustFileName) { // only check uniqueness on a name change
        const parentDir = await directoryService.get(currentFileContent.directory._id);
        const result = parentDir.files.find((file) => file.custFileName === proposedCustFileName && file._id.toString() !== context.id.toString());
        if (result) {
          throw new BadRequest(`committing new file with filename "${proposedCustFileName}" already matches another file in the directory [${result._id.toString()}]`)
        }
      }
    }
  } else {
    // if NOT context.id, then this is a create/post
    const dirId = file.directory?._id;
    if (dirId) { // if autocreated by model upload, the directory might not be set; so skip check
      const parentDir = await directoryService.get(file.directory._id);
      const result = parentDir.files.find((file) => file.custFileName === proposedCustFileName);
      if (result) {
        throw new BadRequest(`filename "${proposedCustFileName}" already found in directory [${result._id.toString()}]`)
      }
    }
  }
  return context;
}
