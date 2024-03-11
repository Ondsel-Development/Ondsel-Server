import {buildNewCurationForSharedModel} from "../services/shared-models/shared-models.curation.js";
import {buildFileSummary} from "../services/file/file.distrib.js";

export async function fixSharedModelCurationsAndKeywordsCommand(app) {
  // update all shared-models with any needed fix
  const smService = app.service('shared-models');
  const modelService = app.service('models');
  // const uploadService = app.service('upload');

  console.log('>>> getting all shared-models');
  const smList = await smService.find({
    paginate: false,
    query: {
      // ALL shared-models get curation; but models without isSystemGenerated are not given keywords
      deleted: false
    },
    pipeline: [
      {
        '$project': {_id: 1, description: 1, cloneModelId: 1, curation: 1, isSystemGenerated: 1}
      },
    ]
  });
  console.log(`>>> qty found: ${smList.length}`);
  for (let sm of smList) {
    console.log(`  >>> sm ${sm._id} \"${sm.description}\":`);
    let newCuration;
    let model;
    try {
      model = await modelService.get(sm.cloneModelId);
    } catch {
      console.log('    >>> model not found; SKIPPING');
      continue;
    }
    sm.model = model;
    newCuration = buildNewCurationForSharedModel(sm);
    if (sm.curation?.description) {
      newCuration.description = sm.curation.description;
    }
    if (sm.curation?.tags) {
      newCuration.tags = sm.curation.tags;
    }
    newCuration.representativeFile = buildFileSummary(model.file);
    console.log(`    >>> new curation: ` + JSON.stringify(newCuration));
    await smService.patch(
      sm._id,
      {
        curation: newCuration,
      }
    );
    console.log(`    >>> UPDATED`);
  }
  console.log(`>>> command complete.`);
}