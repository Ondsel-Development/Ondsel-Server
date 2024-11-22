// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {buildNewCurationForSharedModel} from "../services/shared-models/shared-models.curation.js";

const overwriteAnywayWithNull = false;

export async function addCurationToAllSharedModelsCommand(app) {
  // update all shared-models with curation field
  const smService = app.service('shared-models');
  const modelService = app.service('models');

  console.log('>>> getting all shared-models');
  const smList = await smService.find({
    paginate: false,
    query: {
      isSystemGenerated: true,
    },
    pipeline: [
      {
        '$project': {_id: 1, description: 1, cloneModelId: 1, curation: 1}
      },
    ]
  });
  console.log(`>>> qty found: ${smList.length}`);
  for (let sm of smList) {
    if (sm.curation && overwriteAnywayWithNull === false) {
      console.log(`  >>> sm ${sm._id} \"${sm.description}\" is GOOD already`)
    } else {
      console.log(`   >>> looking up associated model for ${sm._id}`);
      try {
        const model = await modelService.get(sm.cloneModelId);
        sm.model = model;
      } catch {
        console.log('    >>> model not found');
      }
      let newCuration = buildNewCurationForSharedModel(sm);
      if (overwriteAnywayWithNull) {
        newCuration.name = '';
        newCuration.description = '';
        newCuration.tags = [];
      }
      await smService.patch(
        sm._id,
        {
          curation: newCuration,
        }
      );
      console.log('  >>> ... ' + sm.cloneModelId);
      console.log(`  >>> sm ${sm._id} \"${sm.description}\" UPDATED`);
    }
  }
  console.log(`>>> command complete.`);
}