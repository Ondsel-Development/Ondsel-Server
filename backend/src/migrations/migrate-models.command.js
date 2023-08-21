// Migrate models which were created before file service endpoint.

export async function migrateOldModelsCommand(app) {
  const modelService = app.service('models');
  const fileService = app.service('file');
  const db = await modelService.options.Model;

  const data = await modelService.find({
    paginate: false,
    pipeline: [
      { $match: { fileId: { $exists: false }, isSharedModel: false, deleted: { $ne: true } } },
    ]
  });

  for (const model of data) {
    console.log(`\nMigrating model (id: ${model._id.toString()})`);
    const file = await fileService.create({
      custFileName: model.custFileName,
      shouldCommitNewVersion: true,
      version: {
        uniqueFileName: model.uniqueFileName,
      },
      modelId: model._id,
    }, { user: { _id: model.userId }});
    console.log(`File object created (id: ${file._id.toString()})`);
    await db.updateOne({ _id: model._id }, { $unset: { custFileName: '', uniqueFileName: '' }, $set: { fileId: file._id } });
    console.log(`Migration successful for model (id: ${model._id.toString()})`);
  }

}
