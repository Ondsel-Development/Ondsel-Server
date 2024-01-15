export async function addEmptyDirectoriesFieldToDirectoryCommand(app) {
  console.log('Adding directory.directories = [] to all directories where .directories not exists.');
  const directoryService = app.service('directories');
  const db = await directoryService.options.Model;
  const updated = await db.updateMany({ directories: { $exists: false } }, { $set: { directories: [] } });
  console.log(updated);
}
