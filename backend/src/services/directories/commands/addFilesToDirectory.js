// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import {buildFileSummary} from "../../file/file.distrib.js";

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
      files.push(buildFileSummary(file))
      // TODO: investigate that this does not cause a loop
      await fileService.patch(file._id, { directory: _.pick(directory, ['_id', 'name'])})
    }
  }
  data.files = files;
  context.data = _.omit(data, ['shouldAddFilesToDirectory', 'fileIds'])
  return context;
}
