import {buildNewCurationForOrganization} from "../services/organizations/organizations.curation.js";

const overwriteAnywayWithNull = false;

export async function addCurationToAllOrganizationsCommand(app) {
  // bluntly update directories, files, and groups with new Workspace summary
  // update workspaces to `open` field if missing
  const orgService = app.service('organizations');

  console.log('>>> getting all organizations');
  const orgList = await orgService.find({
    paginate: false,
  });
  console.log(`>>> qty found: ${orgList.length}`);
  for (const org of orgList) {
    if (org.curation && overwriteAnywayWithNull === false) {
      console.log(`  >>> org ${org.refName} ${org._id} is GOOD already`)
    } else {
      let newCuration = buildNewCurationForOrganization(org);
      if (overwriteAnywayWithNull) {
        newCuration = null
      }
      await orgService.patch(
        org._id,
        {
          curation: newCuration,
        }
      );
      console.log(`  >>> org ${org.refName} ${org._id} UPDATED`)
    }
  }

  console.log(`>>> command complete.`);
}