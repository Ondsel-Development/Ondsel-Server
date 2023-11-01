import _ from 'lodash';

export const removeDirectoriesFromDirectory = async context => {
  const { data } = context;
  const directory = await context.service.get(context.id);
  let directories = directory.directories || [];
  for (let directoryId of data.directoryIds) {
    if (directories.some(directory => directory._id.toString() === directoryId)){
      directories = directories.filter(directory => directory._id.toString() !== directoryId);
      await context.service.patch(directoryId, { parentDirectory: null });
    }
  }
  data.directories = directories;
  context.data = _.omit(data, ['shouldRemoveDirectoriesFromDirectory', 'directoryIds'])
  return context;
}
