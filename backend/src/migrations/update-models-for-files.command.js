// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// merge first and last name to new 'name' field.

export async function updateModelsForFilesCommand(app) {
  const modelService = app.service('models');

  console.log(">>> getting model list");
  const modelList = await modelService.find({
    paginate: false,
  });
  console.log(`>>>   found ${modelList.length} entries`)

  console.log(">>> running empty 'patch' on each model; this will update every file with a fresh model summary.");
  let ctr = 0;
  for (const modelToPatch of modelList) {
    console.log(`>>>   patching model ${modelToPatch._id}`);
    await modelService.patch(
      modelToPatch._id,
      {}
    );
    ctr++;
  }
  console.log(`>>> ${ctr} entries patched`);
}