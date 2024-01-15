import { buildUserSummary } from '../services/users/users.distrib.js';
import {buildOrganizationSummary} from "../services/organizations/organizations.distrib.js";

export async function updateDirectoriesNeedingEmptySubdirectoryArraysCommand(app) {
  const dirService = app.service('directories');

  console.log('>>> getting all directories');
  const dirList = await dirService.find({
    paginate: false,
  });
  console.log(`>>> directories found: ${dirList.length}`);
  for (let d of dirList) {
    if (d.directories === undefined || d.directories === null) {
      console.log(`>>> directory ${d._id} (${d.name}) is FIXED`);
      try {
        await dirService.patch(
          d._id.toString(),
          {
            directories: []
          }
        )
      } catch (e) {
        console.log(`  >>> ERROR in updating dir ${dir._id.toString()}`);
        console.log(e);
      }
    } else {
      console.log(`>>> directory ${d._id} (${d.name}) is GOOD`);
    }
  }
  console.log(`>>> command complete.`);
}