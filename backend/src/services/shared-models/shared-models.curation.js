import {generateAndApplyKeywords} from "../../curation.schema.js";
import {buildNewCurationForOrganization} from "../organizations/organizations.curation.js";
import {buildFileSummary} from "../file/file.distrib.js";

export function buildNewCurationForSharedModel(sm) {
  let curation =   {
    _id: sm._id,
    collection: 'shared-models',
    name: sm.model?.file?.custFileName || '',
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
  context.result.curation.keywordRefs = await generateAndApplyKeywords(context, context.result.curation);
  await context.service.patch(
    context.result._id,
    {
      curation: context.result.curation
    }
  )
  return context;
}
