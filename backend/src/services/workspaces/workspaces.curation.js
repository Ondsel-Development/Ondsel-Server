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

export const beforePatchHandleCuration = async (context) => {
  try {
    let changeFound = false;
    let needPatch = false; // if true, then ALSO needing changes applied to keywords
    const originalCuration = context.beforePatchCopy.curation || {};
    const patchCuration = context.data.curation || {};
    let newCuration = {...originalCuration, ...patchCuration};
    if (!newCuration._id) {
      // if the original curation _id is missing, then something failed to created it in the past. recreate it first.
      const tempCuration = buildNewCurationForWorkspace(context.beforePatchCopy);
      newCuration = {...tempCuration, ...patchCuration};
      needPatch = true;
      changeFound = true;
    }
    if (context.data.name && context.beforePatchCopy.name !== context.data.name) {
      needPatch = true;
      newCuration.name = context.data.name;
    }
    if (context.data.description && context.beforePatchCopy.description !== context.data.description) {
      needPatch = true;
      newCuration.description = context.data.description;
    }
    if (patchCuration.longDescriptionMd !== undefined && originalCuration.longDescriptionMd !== newCuration.longDescriptionMd) {
      changeFound = true;
    }
    if (patchCuration.tags && !_.isEqual(originalCuration.tags, newCuration.tags)) {
      changeFound = true;
    }
    if (patchCuration.representativeFile && originalCuration.representativeFile !== newCuration.representativeFile) {
      changeFound = true;
    }
    // ignore `curation.promoted` on workspaces for now...
    if (needPatch || changeFound) {
      if (context.beforePatchCopy.open) {
        const newKeywordRefs = await generateAndApplyKeywords(context, newCuration);
        if (!_.isEqual(newKeywordRefs, originalCuration.keywordRefs)) {
          newCuration.keywordRefs = newKeywordRefs;
          needPatch = true;
        }
      }
    }
    if (needPatch) {
      context.data.curation = newCuration;
    }
  } catch (e) {
    console.log(e);
  }
  return context;
}