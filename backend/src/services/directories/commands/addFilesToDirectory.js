import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';

export const addFilesToDirectory = async context => {
  const { data } = context;
  const fileService = context.app.service('file');
  const directory = await context.service.get(context.id);
  const files = directory.files || [];
  for (let fileId of data.fileIds) {
    if (!files.some(file => file._id.toString() === fileId)){
      const file = await fileService.get(fileId);
      if (!directory.workspace._id.equals(file.workspace?._id)){
        throw new BadRequest(
          `File (id: ${file._id.toString()} must belong to same directory workspace.`
        )
      }
      files.push(
        _.pick(file, ['_id', 'custFileName', 'modelId'])
      )
      await fileService.patch(file._id, { directory: _.pick(directory, ['_id', 'name'])})
    }
  }
  data.files = files;
  context.data = _.omit(data, ['shouldAddFilesToDirectory', 'fileIds'])
  return context;
}
