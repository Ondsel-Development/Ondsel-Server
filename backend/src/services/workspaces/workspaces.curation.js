// A "curation" file is for visibly decorating an object and handling pre-emptive keyword indexing (for later searches.)
//

export function buildNewCurationForWorkspace(workspace) {
  let curation =   {
    _id: workspace._id,
    collection: 'workspaces',
    name: workspace.name || "",
    description: workspace.description || "",
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promotedWorkspaces: [],
    promotedSharedModels: [],
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

export const afterPatchHandleCuration = async (context) => {
  try {
    let changeFound = false;
    let needPatch = false; // if true, then ALSO needing changes applied to keywords
    let curation = context.result.curation;
    if (context.beforePatchCopy.name !== context.result.name) {
      needPatch = true;
      curation.name = context.result.name;
    }
    if (context.beforePatchCopy.description !== context.result.description) {
      needPatch = true;
      curation.description = context.result.description;
    }
    if (context.beforePatchCopy.curation.longDescriptionMd !== curation?.longDescriptionMd) {
      changeFound = true;
    }
    if (context.beforePatchCopy.curation.tags !== curation?.tags) {
      changeFound = true;
    }
    if (context.beforePatchCopy.curation.representativeFile !== curation?.representativeFile) {
      changeFound = true;
    }
    // ignore promotedWorkspaces and promotedSharedModels on workspaces
    if (needPatch) {
      await context.service.patch(
        context.result._id,
        {
          curation: curation
        }
      )
    }
    if (needPatch || changeFound) {
      // TODO: generate keywords
    }
  } catch (e) {
    console.log(e);
  }
}