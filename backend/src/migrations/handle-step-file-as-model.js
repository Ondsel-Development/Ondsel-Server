// Recognised old STEP files as 3d model.

export async function handleStepFileAsModelCommand(app) {
  const fileService = app.service('file');
  const fileServiceDb = await fileService.options.Model;
  const modelService = app.service('models');

  const files = await fileServiceDb.find(
    {
      deleted: {$ne: true},
      custFileName : {
        "$regex": "\\.(STEP|stp)$",
        "$options": "i"
      },
      modelId: { "$exists": false }
    }
  ).toArray();

  console.log(`Found files: ${files.length}`);

  for (let file of files) {
    console.log(`> Created model object for file._id: ${file._id.toString()}`);
    const m = await modelService.create({
      fileId: file._id.toString(),
      createSystemGeneratedShareLink: false,
      shouldStartObjGeneration: true,
    }, {
      user: { _id: file.userId }
    });
    console.log(`>>> Model object created: ${m._id.toString()}`);
  }
}
