import mongodb from 'mongodb';
import _ from 'lodash';
import { OrganizationTypeMap } from '../services/organizations/organizations.subdocs.schema.js';

const userEmail = 'amritpal@ondsel.com';
const userCfg = 'fecd69a2-f30f-44f1-8c23-863998b3f9ac.cfg';
const systemCfg = '35518e54-4743-46bd-a147-a92ea4ecfe76.cfg';

export async function createOndselOrganizationCommand(app) {
  const organizationService = app.service('organizations');
  const userService = app.service('users');
  const preferenceService = app.service('preferences');
  const orgDb = await organizationService.options.Model;
  const prefDb = await preferenceService.options.Model;

  // Fetch user
  console.log(`>>> Fetching user ${userEmail}`);
  const users = await userService.find({query: {email: userEmail}})
  if (users.total) {
    const user = users.data[0];
    console.log('>>> User found');
    const organizations = await organizationService.find({ query: { refName: 'Ondsel' } })
    let ondselOrganization;
    if (organizations.total === 0) {
      console.log('>>> Creating Ondsel Organization');
      // Create ondsel organization
      ondselOrganization = await organizationService.create({
        name: 'Ondsel',
        refName: 'Ondsel',
        type: OrganizationTypeMap.ondsel,
      }, { user: user });
      console.log('Organization created: ', ondselOrganization);
    } else {
      console.log('>>> Ondsel Organization found, no need to create');
      ondselOrganization = organizations.data[0];
    }

    if (!ondselOrganization.preferencesId) {
      console.log('>>> creating a preference object');
      const pref = await preferenceService.create({
        organizationId: ondselOrganization._id.toString(),
        version: {
          files: [
            {
              fileName: 'user.cfg',
              uniqueFileName: userCfg,
              additionalData: {},
              additionalKeysToSave: []
            },
            {
              fileName: 'system.cfg',
              uniqueFileName: systemCfg,
              additionalData: {},
              additionalKeysToSave: []
            }
          ]
        }
      }, { user: user });

      const newPref = await prefDb.insertOne({
        ..._.omit(pref, 'currentVersion'),
        _id: new mongodb.ObjectId('000000000000000000000000')
      });

      console.log('>>> Created Preference object', newPref._id.toString());

      await prefDb.deleteOne(
        { _id: pref._id } // Original ObjectID
      )
      const updateOrg = await orgDb.updateOne(
        { _id: ondselOrganization._id }, // Specify the current ObjectID
        { $set: { preferencesId: new mongodb.ObjectId('000000000000000000000000') } } // Set the new ObjectID
      )

    } else {
      console.log('>>> Preference object already exists');
    }

  }

};
