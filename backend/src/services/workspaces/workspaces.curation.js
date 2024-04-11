// A "curation" file is for visibly decorating an object and handling pre-emptive keyword indexing (for later searches.)
//

import {generateAndApplyKeywords} from "../../curation.schema.js";
import _ from "lodash";
import {buildWorkspaceSummary} from "./workspaces.distrib.js";

export function buildNewCurationForWorkspace(workspace) {
  let curation =   {
    _id: workspace._id,
    collection: 'workspaces',
    nav: {
      slug: workspace.organization.refName,
      wsname: workspace.refName,
    },
    name: workspace.name || "",
    slug: workspace.refName,
    description: workspace.description || "",
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const afterCreateHandleWorkspaceCuration = async (context) => {
  // first, set up the curation
  context.result.curation = buildNewCurationForWorkspace(context.result);
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
