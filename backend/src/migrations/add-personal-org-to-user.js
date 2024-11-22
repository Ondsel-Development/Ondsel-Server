// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { buildOrganizationSummary } from '../services/organizations/organizations.distrib.js';
import { OrganizationTypeMap } from '../services/organizations/organizations.subdocs.schema.js';

export async function addPersonalOrgToUserCommand(app) {
  const organizationService = app.service('organizations');
  const userService = app.service('users');
  const workspaceService = app.service('workspaces');
  const organizationDb = await organizationService.options.Model;
  console.log('>>> Collecting users where personalOrganization not exists');
  const users = await userService.find({
    paginate: false,
    pipeline: [{
      $match: {
        'personalOrganization': { $exists: false }
      }
    }]
  });
  console.log(`>>> Users found: ${users.length}`);

  for (let user of users){
    console.log(`>>> Add personalOrganization field to user (${user._id.toString()})`);
    try {
      const workspace = await workspaceService.get(user.defaultWorkspaceId);
      const organization = await organizationService.get(workspace.organizationId);

      console.log(`>>> Patching user (${user._id.toString()})`);
      await userService.patch(user._id, { personalOrganization: buildOrganizationSummary(organization) });
      console.log(`>>> Patching organization (${organization._id.toString()})`);
      await organizationService.patch(organization._id, { type: OrganizationTypeMap.personal });
    } catch (e) {
      console.log(`>>> Error in updating user (${user._id.toString()}`);
      console.log(e);
    }
    console.log('\n');
  }


  console.log('>>> Updating organization where type not exists');
  const updatedData = await organizationDb.updateMany(
    { type: { $exists: false } },
    { $set: { type: OrganizationTypeMap.private } }
  );
  console.log(`>>> Organization updated!`);
  console.log(updatedData);

}
