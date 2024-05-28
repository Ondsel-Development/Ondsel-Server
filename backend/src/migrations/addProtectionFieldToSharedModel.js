import {ProtectionTypeMap} from "../services/shared-models/shared-models.subdocs.schema.js";

export async function addProtectionFieldToSharedModelCommand(app) {
  const smService = app.service('shared-models');
  const db = await smService.options.Model;
  console.log('>>> Getting shared models');
  const smList = await smService.find({
    paginate: false,
    query: { $select: ['_id', 'showInPublicGallery', 'protection'] },
    pipeline: [
      { '$match': { protection: { $exists: 0 } } },
    ]
  });
  console.log(`>>> Found ${smList.length} shared models`);
  for (let sm of smList) {
    console.log(`  >>> sm ${sm._id}":`);
    try {
      await db.updateOne(
        { _id: sm._id },
        {
          $unset: { showInPublicGallery: 1 }, // 1 means remove attribute from document
          $set: { protection: sm.showInPublicGallery ? ProtectionTypeMap.listed : ProtectionTypeMap.unlisted }
        }
      );
      console.log(`    >>> UPDATED`);
    } catch (e) {
      console.log(`   >>>> ERROR`);
    }
  }
  console.log(`>>> command complete.`);
}
