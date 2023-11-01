import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';

export const addDirectoriesToDirectory = async context => {
  const { data } = context;
  const directory = await context.service.get(context.id);
  const directories = directory.directories || [];
  for (let directoryId of data.directoryIds) {
    if (!directories.some(directory => directory._id.toString() === directoryId)){
      const directoryToAdd = await context.service.get(directoryId);
      if (!directory.workspace._id.equals(directoryToAdd.workspace._id)){
        throw new BadRequest(
          `Directory (id: ${directoryToAdd._id.toString()} must belong to same directory workspace.`
        )
      }
      if (directory._id.equals(directoryToAdd._id)){
        throw new BadRequest(
          `Directory (id: ${directoryToAdd._id.toString()}) can't be same with patching directory`
        );
      }
      directories.push(
        _.pick(directoryToAdd, ['_id', 'name'])
      )
      await context.service.patch(directoryToAdd._id, { parentDirectory: _.pick(directory, ['_id', 'name']) });
    }
  }
  data.directories = directories;
  context.data = _.omit(data, ['shouldAddDirectoriesToDirectory', 'directoryIds'])
  return context;
}
