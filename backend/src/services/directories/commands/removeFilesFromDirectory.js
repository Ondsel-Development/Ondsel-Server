import _ from 'lodash';

export const removeFilesFromDirectory = async context => {
  const { data } = context;
  const fileService = context.app.service('file');
  const directory = await context.service.get(context.id);
  let files = directory.files || [];
  for (let fileId of data.fileIds) {
    if (files.some(file => file._id.toString() === fileId)){
      files = files.filter(file => file._id.toString() !== fileId);
      await fileService.patch(fileId, { directory: {} });
    }
  }
  data.files = files;
  context.data = _.omit(data, ['shouldRemoveFilesFromDirectory', 'fileIds'])
  return context;
}
