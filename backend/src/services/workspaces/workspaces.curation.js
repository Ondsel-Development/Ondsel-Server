// A "curation" file is for visibly decorating an object and handling pre-emptive keyword indexing (for later searches.)
//

import {generateAndApplyKeywords, navTargetMap} from "../../curation.schema.js";
import {OrganizationTypeMap} from "../organizations/organizations.subdocs.schema.js";

export function buildNewCurationForWorkspace(workspace) {
  let curation =   {
    _id: workspace._id,
    collection: 'workspaces',
    nav: {
      target: navTargetMap.workspaces,
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
  // only set ONE of the following; this allows the nav system to determine "/org" vs "/user" prefix
  //   /org/:orgname/workspace/:wsname vs /user/:username/workspace/:wsname
  if (workspace.organization.type === OrganizationTypeMap.personal) {
    if (workspace.owner) {
      curation.nav.username = workspace.owner.username;
    } else {
      curation.nav.username = workspace.groupsOrUsers[0].groupOrUser.username;
    }
  } else {
    curation.nav.orgname = workspace.organization.refName;
  }
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
