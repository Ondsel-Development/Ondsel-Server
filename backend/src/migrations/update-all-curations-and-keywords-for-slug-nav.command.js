import {buildNewCurationForSharedModel} from "../services/shared-models/shared-models.curation.js";
import {buildFileSummary} from "../services/file/file.distrib.js";
import {buildNewCurationForOrganization} from "../services/organizations/organizations.curation.js";
import {OrganizationTypeMap} from "../services/organizations/organizations.subdocs.schema.js";
import {buildNewCurationForUser} from "../services/users/users.curation.js";
import {buildNewCurationForWorkspace} from "../services/workspaces/workspaces.curation.js";

export async function updateAllCurationsAndKeywordsForSlugNavCommand(app) {
  // update orgs (both personal and other), workspaces, and shared-models with curation fixes
  // specifically, adding the `slug` and `nav` fields.
  const wsService = app.service('workspaces');
  const smService = app.service('shared-models');
  const orgService = app.service('organizations');

  const curationsMap = {};

  console.log('>>> workspaces');
  let list = await wsService.find({
    paginate: false,
    query: {
      // open: true
    },
  });
  console.log(`>>>   qty found: ${list.length}`);
  for (let item of list) {
    console.log(`  >>>   ws ${item._id}`);
    try {
      let newCuration = item.curation;
      const refCuration = buildNewCurationForWorkspace(item);
      newCuration.slug = refCuration.slug;
      newCuration.nav = refCuration.nav;
      curationsMap[item._id.toString()] = newCuration;
      await wsService.patch(
        item._id,
        {
          curation: newCuration,
        }
      );
    } catch(e) {
      console.log(`      err: ${e.name}`);
    }
  }
  console.log('>>> workspaces done');

  console.log('>>> shared-models');
  list = await smService.find({
    paginate: false,
    query: {
      deleted: false
    },
  });
  console.log(`>>>   qty found: ${list.length}`);
  for (let item of list) {
    console.log(`  >>>   shared-model ${item._id}`);
    try {
      let newCuration = item.curation;
      if (!newCuration) {
        // because of possible private sharing, all share-links getting a curation.
        // However, only showInPublicGallery shares are included in keywords
        newCuration = buildNewCurationForSharedModel(item);
      } else {
        const refCuration = buildNewCurationForSharedModel(item);
        newCuration.slug = refCuration.slug; // this is always an empty string
        newCuration.nav = refCuration.nav;
      }
      curationsMap[item._id.toString()] = newCuration;
      await smService.patch(
        item._id,
        {
          curation: newCuration,
        }
      );
    } catch(e) {
      console.log(`      err: ${e.name}`);
    }
  }
  console.log('>>> shared-models done');

  console.log('>>> organizations; PASS 1 (curation)');
  list = await orgService.find({
    paginate: false,
    query: {
    },
  });
  console.log(`>>>   qty found: ${list.length}`);
  for (let item of list) {
    console.log(`  >>>   org ${item._id}`);
    try {
      let newCuration = item.curation;
      let refCuration;
      if (item.type === OrganizationTypeMap.personal) {
        refCuration = buildNewCurationForUser(item.owner);
      } else {
        refCuration = buildNewCurationForOrganization(item);
      }
      newCuration.slug = refCuration.slug;
      newCuration.nav = refCuration.nav;
      curationsMap[newCuration._id.toString()] = newCuration; // this can differ for Personal
      await orgService.patch(
        item._id,
        {
          curation: newCuration,
        }
      );
    } catch(e) {
      console.log(`      err: ${e.name}`);
    }
  }
  console.log('>>> organizations; PASS 2 (promoted)');
  for (let item of list) {
    console.log(`  >>>   org ${item._id}`);
    try {
      let newCuration = item.curation;
      let currentPromoted = newCuration.promoted || [];
      let newPromoted = [];
      for (let promo of currentPromoted) {
        if (curationsMap.hasOwnProperty(promo.curation._id.toString())) {
          promo.curation = curationsMap[promo.curation._id.toString()];
          delete promo.curation.promoted;
          delete promo.curation.keywordRefs;
          newPromoted.push(promo);
        } else {
          console.log(`    >>> invalid promo ${promo.curation._id.toString()}`);
        }
      }
      newCuration.promoted = newPromoted;
      await orgService.patch(
        item._id,
        {
          curation: newCuration,
        }
      );
    } catch(e) {
      console.log(`      err: ${e.name}`);
    }
  }
  console.log('>>> organizations done');

  console.log(`>>> command complete.`);
}