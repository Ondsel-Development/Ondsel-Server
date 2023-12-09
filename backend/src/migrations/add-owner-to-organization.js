import { buildUserSummary } from '../services/users/users.distrib.js';

export async function addOwnerToOrganizationCommand(app) {
  const organizationService = app.service('organizations');
  const userService = app.service('users');
  const db = await organizationService.options.Model;

  console.log('>>> Collecting organizations where owner not exists');
  const organizations = await organizationService.find({
    paginate: false,
    pipeline: [{
      $match: {
        'owner': { $exists: false }
      }
    }]
  });
  console.log(`>>> Organizations found: ${organizations.length}`);
  for (let organization of organizations) {
    console.log(`>>> Updating organization (${organization._id.toString()})`);
    try {
      const user = await userService.get(organization.createdBy);
      await db.updateOne({ _id: organization._id }, { $set: { owner: buildUserSummary(user) } });
    } catch (e) {
      console.log(`>>> Error in updating organization (${organization._id.toString()}`);
      console.log(e);
      continue;
    }
    console.log(`>>> Successfully updated organization (${organization._id.toString()})`);
  }
}
