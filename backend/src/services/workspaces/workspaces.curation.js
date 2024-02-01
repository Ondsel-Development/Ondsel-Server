// A "curation" file is for visibly decorating an object and handling pre-emptive keyword indexing (for later searches.)
//

import {generateAndApplyKeywords} from "../../curation.schema.js";
import _ from "lodash";

export function buildNewCurationForWorkspace(workspace) {
  let curation =   {
    _id: workspace._id,
    collection: 'workspaces',
    name: workspace.name || "",
    description: workspace.description || "",
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const afterCreateHandleCuration = async (context) => {
  // first, set up the curation
  context.result.curation = buildNewCurationForWorkspace(context.result);
  await context.service.patch(
    context.result._id,
    {
      curation: context.result.curation
    }
  )
  // second, generate keywords (TODO)
  return context;
}

export const beforePatchHandleCuration = async (context) => {
  try {
    let changeFound = false;
    let needPatch = false; // if true, then ALSO needing changes applied to keywords
    const patchCuration = context.data.curation || {};
    const curation = {...context.beforePatchCopy.curation, ...patchCuration};
    if (context.data.name && context.beforePatchCopy.name !== context.data.name) {
      needPatch = true;
      curation.name = context.data.name;
    }
    if (context.data.description && context.beforePatchCopy.description !== context.data.description) {
      needPatch = true;
      curation.description = context.data.description;
    }
    if (context.data.curation?.longDescriptionMd !== undefined && context.beforePatchCopy.curation?.longDescriptionMd !== curation?.longDescriptionMd) {
      changeFound = true;
    }
    if (context.data.curation?.tags && context.beforePatchCopy.curation?.tags !== curation?.tags) {
      changeFound = true;
    }
    if (context.data.curation?.representativeFile && context.beforePatchCopy.curation?.representativeFile !== curation?.representativeFile) {
      changeFound = true;
    }
    // ignore `curation.promoted` on workspaces for now...
    if (needPatch || changeFound) {
      if (context.beforePatchCopy.open) {
        const newKeywordRefs = await generateAndApplyKeywords(context, curation);
        if (!_.isEqual(newKeywordRefs, context.beforePatchCopy.curation?.keywordRefs)) {
          curation.keywordRefs = newKeywordRefs;
          needPatch = true;
        }
      }
    }
    if (needPatch) {
      context.data.curation = curation;
    }
  } catch (e) {
    console.log(e);
  }
  return context;
}