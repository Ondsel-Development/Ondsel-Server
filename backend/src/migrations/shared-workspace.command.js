// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from 'lodash';

export async function migrateObjectsForSharedWorkspaceCommand(app) {
  console.log('Running migrate objects for shared workspaces');
  const userService = app.service('users');
  const organizationService = app.service('organizations');
  const workspaceService = app.service('workspaces');
  const directoryService = app.service('directories');
  const fileService = app.service('file');
  const users = await userService.find({ paginate: false });
  for (let user of users) {
    console.log(`- Patching user (id: ${user._id.toString()})`);
    const organization = await organizationService.create({ name: 'Personal' }, { user: user });
    console.log(`-- created Organization: (id: ${organization._id.toString()})`);
    const workspace = await workspaceService.create(
      { name: 'Default', description: 'Your workspace', organizationId: organization._id },
      { user: user }
    )
    console.log(`-- created workspace: (id: ${workspace._id.toString()})`);
    await userService.patch(
      user._id,
      {
        defaultWorkspaceId: workspace._id,
      }
    )
    console.log(`-- patching user (id: ${user._id.toString()}) for defaultWorkspaceId`);
    const files = await fileService.find({ user: user, paginate: false })
    for (let file of files) {
      if (!file.isSystemGenerated) {
        console.log(`-- patching file (id: ${file._id.toString()})`);
        await fileService.patch(
          file._id,
          {
            workspace: _.pick(workspace, ['_id', 'name']),
            directory: workspace.rootDirectory,
          },
          { user: user }
        );
      }
    }

    await directoryService.patch(
      workspace.rootDirectory._id,
      {
        shouldAddFilesToDirectory: true,
        fileIds: files.filter(file => !file.isSystemGenerated).map(file => file._id)
      },
      { user: user }
    );
    console.log(`-- patching adding files to root directory (id: ${workspace.rootDirectory._id.toString()})`);
  }
}
