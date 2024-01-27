// A "curation" file is for visibly decorating an object and handling pre-emptive keyword indexing (for later searches.)
//

export function buildNewCurationForWorkspace(workspace) {
  let curation =   {
    _id: workspace._id,
    collection: 'workspaces',
    name: workspace.name,
    description: workspace.description,
    longDescription_md: '',
    tags: [],
    representativeFile: null,
    promotedWorkspaces: [],
    promotedSharedModels: [],
    keywordRefs: [],
  };
  return curation;
}