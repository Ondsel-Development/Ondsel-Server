import {isAdminUser} from "../../hooks/is-user.js";
import {userPublicFields} from "./users.schema.js";
import {beforePatchHandleGenericCuration} from "../../curation.schema.js";
import {buildNewCurationForOrganization} from "../organizations/organizations.curation.js";

export function buildNewCurationForUser(user) {
  // note: this curation is stored in the Personal Org, but this routine is under 'users' to be thematic
  let curation =   {
    _id: user._id,
    collection: 'users',
    name: user.name || '',
    description: '',
    longDescriptionMd: '',
    tags: [],
    representativeFile: null,
    promoted: [],
    keywordRefs: [],
  };
  return curation;
}

export const specialUserOrgCurationHandler = async context => {
  // a user does not have a "curation". Instead that is stored in the org. This function handles that for a patch.
  if (!context.data.name || context.data.name === context.beforePatchCopy.name) {
    // only a name change should trigger a new change to the Personal org
    return context;
  }
  const organizationService = context.app.service('organizations');
  const pid = context.beforePatchCopy.personalOrganization._id;
  const org = await organizationService.get(pid);
  let curation = org.curation;
  curation.name = context.data.name;
  await organizationService.patch(
    pid,
    {
      curation: curation
    }
  )
  return context;
}
