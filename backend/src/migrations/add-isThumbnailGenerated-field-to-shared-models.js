// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Add isThumbnailGenerated property to shared-models object where not exists

export async function addIsThumbnailGeneratedFieldToSharedModelsCommand(app) {
  const modelService = app.service('models');
  const sharedModelService = app.service('shared-models');
  const db = await modelService.options.Model;

  const sharedModels = await sharedModelService.find({
    paginate: false,
    query: { isThumbnailGenerated: { $exists: false } }
  });

  console.log(`Found ${sharedModels.length} sharedModels where isThumbnailGenerated field not exists`);

  for (const sharedModel of sharedModels) {
    console.log(`\n> Adding isThumbnailGenerated field to sharedModel (id: ${sharedModel._id.toString()})`);

    let model = {};
    if (sharedModel.dummyModelId) {
      try {
        model = await modelService.get(sharedModel.dummyModelId);
      } catch (e) {
        console.log(`>> sharedModel.dummyModelId (${sharedModel.dummyModelId.toString()}) not exists`);
      }
    }
    await sharedModelService.patch(
      sharedModel._id,
      { isThumbnailGenerated: !!model.thumbnailUrl }
    )
    console.log(`> Migration successful for sharedModel (id: ${sharedModel._id.toString()})`);
  }

}
