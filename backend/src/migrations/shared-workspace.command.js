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
    const files = await fileService.find({ user: user, paginate: false })
    for (let file of files) {
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

    await directoryService.patch(
      workspace.rootDirectory._id,
      {
        shouldAddFilesToDirectory: true,
        fileIds: files.map(file => file._id)
      },
      { user: user }
    );
    console.log(`-- patching adding files to root directory (id: ${workspace.rootDirectory._id.toString()})`);
  }
}
