export async function addOrgSecondaryReferencesToAllOrganizationsCommand(app) {
  const orgService = app.service('organizations');
  const orgSecondaryReferencesService = app.service('org-secondary-references');

  console.log('>>> Getting organizations');
  const orgList = await orgService.find({
    paginate: false,
    query: { $select: ['_id', 'orgSecondaryReferencesId'] },
    pipeline: [
      { '$match': { orgSecondaryReferencesId: { $exists: 0 } } },
    ]
  });
  console.log(`>>> Found ${orgList.length} organizations`);
  for (let org of orgList) {
    console.log(`  >>> Organizations: ${org._id}`);
    try {
      const orgSecondaryReferences = await orgSecondaryReferencesService.create({ organizationId: org._id });
      console.log(`    >>> Created OrgSecondaryReferences object: ${orgSecondaryReferences._id}`);
      await orgService.patch(
        org._id,
        {
          orgSecondaryReferencesId: orgSecondaryReferences._id,
        }
      );
      console.log(`    >>> UPDATED`);
    } catch (e) {
      console.log(`   >>>> ERROR`);
    }
  }
  console.log(`>>> command complete.`);
}
