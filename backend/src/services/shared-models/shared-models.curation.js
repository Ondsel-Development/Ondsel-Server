import {generateAndApplyKeywords} from "../../curation.schema.js";
import {buildNewCurationForOrganization} from "../organizations/organizations.curation.js";

export function buildNewCurationForSharedModel(sm) {
  let curation =   {
    _id: sm._id,
    collection: 'shared-models',
    name: sm.model?.file?.custFileName || '',
    description: sm.description || '',
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const afterCreateHandleSharedModelCuration = async (context) => {
  // first, set up the curation
  context.result.curation = buildNewCurationForOrganization(context.result);
  const newKeywordRefs = await generateAndApplyKeywords(context, context.result.curation);
  context.result.curation.keywordRefs = newKeywordRefs;
  await context.service.patch(
    context.result._id,
    {
      curation: context.result.curation
    }
  )
  return context;
}
