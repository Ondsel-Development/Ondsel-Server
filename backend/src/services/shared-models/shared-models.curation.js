import {generateAndApplyKeywords} from "../../curation.schema.js";
import {buildNewCurationForOrganization} from "../organizations/organizations.curation.js";
import {buildFileSummary} from "../file/file.distrib.js";

export function buildNewCurationForSharedModel(sm) {
  let curation =   {
    _id: sm._id,
    collection: 'shared-models',
    nav: {
      id: sm._id.toString(),
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
  await context.service.patch(
    context.result._id,
    {
      curation: context.result.curation
    }
  )
  return context;
}
