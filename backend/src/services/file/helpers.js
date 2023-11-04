import _ from 'lodash';
import {BadRequest} from "@feathersjs/errors";

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
    data.workspace = _.pick(workspace, ['_id', 'name']);
    data.directory = workspace.rootDirectory;
    context.data = data;
  }
  return context;
}
