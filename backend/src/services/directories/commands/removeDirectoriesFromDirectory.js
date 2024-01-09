import _ from 'lodash';

export const removeDirectoriesFromDirectory = async context => {
  const { data } = context;
  const directory = await context.service.get(context.id);
  let directories = directory.directories || [];
  for (let directoryId of data.directoryIds) {
    directories = directories.filter(directory => directory._id.toString() !== directoryId.toString());
  }
  data.directories = directories;
  context.data = _.omit(data, ['shouldRemoveDirectoriesFromDirectory', 'directoryIds'])
  return context;
}
