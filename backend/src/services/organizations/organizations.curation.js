import {generateAndApplyKeywords} from "../../curation.schema.js";
import _ from "lodash";
import {buildNewCurationForWorkspace} from "../workspaces/workspaces.curation.js";

export function buildNewCurationForOrganization(org) {
  let curation =   {
    _id: org._id,
    collection: 'organizations',
    name: org.name || '',
    description: '',
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const afterCreateHandleOrganizationCuration = async (context) => {
  // first, set up the curation
  if (context.result.curation) {
    // this will happen for a Personal type org
    return context;
  }
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
