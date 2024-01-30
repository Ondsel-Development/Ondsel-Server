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