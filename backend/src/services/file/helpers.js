import _ from 'lodash';
import {BadRequest} from "@feathersjs/errors";
import {buildWorkspaceSummary} from "../workspaces/workspaces.distrib.js";

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