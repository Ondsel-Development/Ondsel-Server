/*
For some org-secondary-references, shared-model summary not up-to date (have missing fields) and because of corrupted data
user not able to share any share link to user (api throwing ValidationError).
 */

import { CollectionNameMap } from '../services/org-secondary-references/bookmark.schema.js';
import { CollectionNameMappingWithSummaryBuildMethods } from '../services/org-secondary-references/helpers.js';


export async function fixedSharedWithMeSchemasCommand(app) {
  const orgSecRefService = app.service('org-secondary-references');
  const orgSecRefServiceDb = await orgSecRefService.options.Model;

  const data = await orgSecRefService.find({
    paginate: false,
    pipeline: [
      { $match: { deleted: { $ne: true }, sharedWithMe: { $exists: true } } },
    ]
  });

  for (const orgSecRef of data) {
    const sharedWithMeData = [];
    for (const share of orgSecRef.sharedWithMe) {
      const doc = await app.service(CollectionNameMap[share.collectionName]).get(share.collectionSummary._id);
      share.collectionSummary = CollectionNameMappingWithSummaryBuildMethods[CollectionNameMap[share.collectionName]](doc);
      sharedWithMeData.push(share);
    }
    if (sharedWithMeData.length > 0) {
      await orgSecRefServiceDb.updateOne({ _id: orgSecRef._id }, { $set: { sharedWithMe: sharedWithMeData } });
      console.log(`>>> Updated sharedWithMe data for ${orgSecRef._id.toString()}`);
    }
  }
  console.log(`>>> Successfully updated sharedWithMe data for org-secondary-references`);
}
