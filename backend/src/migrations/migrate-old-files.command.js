// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Migrate old files objects which were created before https://github.com/Ondsel-Development/Ondsel-Server/pull/60.
import _ from 'lodash';

export async function migrateOldFilesCommand(app) {
  const modelService = app.service('models');
  const fileService = app.service('file');
  const fileDb = await fileService.options.Model;

  const data = await modelService.find({
    paginate: false,
    pipeline: [
      { $match: {deleted: {$ne: true}, fileId: {$exists: true}}},
    ]
  });

  for (const model of data) {
    const file =  await fileService.get(model.fileId);
    console.log(`\nMigrating file (id: ${file._id.toString()} of model (id: ${model._id.toString()})`);

    const filePatchData = {};
    if (file.userId === undefined) {
      filePatchData.userId = model.userId;
    }
    if (file.modelId === undefined) {
      filePatchData.modelId = model._id;
    }
    if (file.isSystemGenerated === undefined) {
      filePatchData.isSystemGenerated = model.isSharedModel;
    }
    if (file.custFileName === undefined) {
      filePatchData.custFileName = model.custFileName;
    }

    if (!_.isEmpty(filePatchData)) {
      console.log(`Patching file (id: ${file._id}) with data:`);
      console.log(filePatchData);
      const res = await fileDb.updateOne({ _id: file._id }, { $set: filePatchData });
      console.log(res)
    } else {
      console.log(`File object is already up-to-date, no need to patch.`)
    }

    console.log(`Migration successful file (id: ${file._id.toString()}) object of model (id: ${model._id.toString()})`);
  }

}
