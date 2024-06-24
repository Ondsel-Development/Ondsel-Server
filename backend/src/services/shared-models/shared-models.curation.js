import {generateAndApplyKeywords, navTargetMap} from "../../curation.schema.js";
import {buildNewCurationForOrganization} from "../organizations/organizations.curation.js";
import {buildFileSummary} from "../file/file.distrib.js";

export function buildNewCurationForSharedModel(sm) {
  let curation =   {
    _id: sm._id,
    collection: 'shared-models',
    nav: {
      target: navTargetMap.sharedModels,
      sharelinkid: sm._id.toString(),
    },
    name: sm.model?.file?.custFileName || '',
    slug: '', // a shared model has no searchable slug
    description: sm.description || '',
    longDescriptionMd: '',
    tags: [],
    representativeFile: null, // this is handled later by patches
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const afterCreateHandleSharedModelCuration = async (context) => {
  // first, set up the curation
  context.result.curation = buildNewCurationForSharedModel(context.result);
  console.log("starting patch");
  const smService = context.service;
  const smDb = await smService.options.Model;
  await smDb.updateOne(
    { _id: context.result._id },
    {
      $set: {
        curation: context.result.curation
      },
    }
  )
  console.log(context.result.curation);
  console.log("done with patch");
  return context;
}
