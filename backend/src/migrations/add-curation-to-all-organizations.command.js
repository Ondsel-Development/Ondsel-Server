// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {buildNewCurationForOrganization} from "../services/organizations/organizations.curation.js";
import {OrganizationTypeMap} from "../services/organizations/organizations.subdocs.schema.js";
import {buildNewCurationForUser} from "../services/users/users.curation.js";

const overwriteAnyway = false;

export async function addCurationToAllOrganizationsCommand(app) {
  // bluntly update directories, files, and groups with new Workspace summary
  // update workspaces to `open` field if missing
  const orgService = app.service('organizations');
  const userService = app.service('users');

  console.log('>>> getting all organizations');
  const orgList = await orgService.find({
    paginate: false,
  });
  console.log(`>>> qty found: ${orgList.length}`);
  for (const org of orgList) {
    if (org.curation && overwriteAnyway === false) {
      console.log(`  >>> org ${org.refName} ${org._id} is GOOD already`)
    } else {
      let newCuration;
      if (org.type === OrganizationTypeMap.personal) {
        const user = await userService.get(org.owner._id);
        newCuration = buildNewCurationForUser(user)
      } else {
        newCuration = buildNewCurationForOrganization(org);
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