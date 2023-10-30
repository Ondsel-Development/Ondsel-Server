// A "distrib" file is for taking/sending "second-class" information between collections.
//
// Each collection is the "source of truth" for it's key fields. However, many collections have
// "summary" sub-documents stored that contain information summaries from other collections. These
// sub-documents are "second-class" because they are not authoritative and might need update when
// the reference collection is updated.


//
// SUMMARY  --  Summary of the Source-Of-Truth fields in this collection; never include summaries in a summary
//

// nothing

//
// DISTRIBUTE AFTER (HOOK)
//

// nothing

//
// UPDATE  --  Update secondary fields in this collection; suppresses further patches to prevent loops
//             These routines are used by _other_ collections after creation/update/deletion
//

export async function upsertGroupSummaryToOrganization(context, orgId, groupSummary) {
  const orgService = context.app.service('organizations');
  const org = await orgService.find(orgId);
  let groupList = org.groups || [];
  const matchingOrg = (orgDetail) => orgDetail._id === orgId;
  const index = groupList.findIndex(matchingOrg);
  if (index === -1) {
    groupList.push(groupSummary);
  } else {
    groupList[index] = groupSummary;
  }
  await orgService.patch(
    orgId,
    {
      groups: groupList,
    },
    {
      authentication: context.params.authentication,
    }
  );
}
