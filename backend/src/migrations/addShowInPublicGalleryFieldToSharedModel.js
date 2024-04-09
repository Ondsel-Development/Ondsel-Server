export async function addShowInPublicGalleryFieldToSharedModelCommand(app) {
  const smService = app.service('shared-models');
  console.log('>>> Getting shared models');
  const smList = await smService.find({
    paginate: false,
    query: { $select: ['_id', 'isSystemGenerated', 'showInPublicGallery'] },
    pipeline: [
      { '$match': { showInPublicGallery: { $exists: 0 } } },
    ]
  });
  console.log(`>>> Found ${smList.length} shared models`);
  for (let sm of smList) {
    console.log(`  >>> sm ${sm._id}":`);
    try {
      await smService.patch(
        sm._id,
        {
          showInPublicGallery: !!sm.isSystemGenerated,
        }
      );
      console.log(`    >>> UPDATED`);
    } catch (e) {
      console.log(`   >>>> ERROR`);
    }
  }
  console.log(`>>> command complete.`);
}
