// add initial TOS and PP documents

import {websiteTargetTypeMap} from "../services/sitemaps/sitemaps.schema.js";

export async function rebuildSiteMapCommand(app) {

  const sitemapsService = app.service('sitemaps');

  console.log(`>>> updating sitemap for ${websiteTargetTypeMap.shareOndselCom}`);
  console.log('>>>   getting sitemap doc');
  let sitemaps = await sitemapsService.find({
    paginate: false,
    pipeline: [
      { $match: {websiteTarget: websiteTargetTypeMap.shareOndselCom} },
    ]
  });
  let siteMap = (sitemaps.length === 1) ? sitemaps[0] : {
    websiteTarget: websiteTargetTypeMap.shareOndselCom,
    lastUpdate: 0,
    urls:  [],
  };
  siteMap.lastUpdate = Date.now();
  console.log('>>>   pulling public share urls');
  siteMap.urls = await getUrlsForShare(app);
  console.log(`>>>   saving results`);
  if (siteMap._id === undefined) {
    const queryResult = await sitemapsService.create(siteMap);
    console.log(`>>>   done; created new doc with ${queryResult.urls.length} urls`);
  } else {
    const queryResult = await sitemapsService.patch(
      siteMap._id,
      {
        lastUpdate: siteMap.lastUpdate,
        urls: siteMap.urls,
      }
    );
    console.log(`>>>   done; updated with ${queryResult.urls.length} urls`);
  }
}

async function getUrlsForShare(app) {
  let result = [];
  const sharedModelsService = app.service('shared-models');
  let shares = await sharedModelsService.find({
    query: {
      $limit: 50000, // max allowed by spec; see sitemaps.org
      $select: ['_id', 'updatedAt'],
      $sort: {
        _id: 1,   // when we approach 50,000 urls, rethink the order and query
      },
      canViewModel: true,
      isActive: true,
      deleted: {$ne: true},
    },
  });
  for (const share of shares.data) {
    const dt = new Date(share.updatedAt);
    const dateStr = `${dt.getFullYear()}-${dt.getMonth().toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2,'0')}`;
    result.push({
      refId: share._id,
      loc: `https:\\\\share.ondsel.com\\share\\${share._id}`,
      lastMod: dateStr,
    })
  }
  return result;
}
