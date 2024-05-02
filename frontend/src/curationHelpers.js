import {models} from "@feathersjs/vuex";

export function removeNonPublicItems(curation) {
  // Remove unneeded items from curation that is being shared.
  //
  // This function is being made common so that this removal is consistent and modifiable in one place.
  delete curation.promoted;
  delete curation.keywordRefs;
}

export function translateCollection(collection) {
  let tr = '';
  switch (collection) {
    case 'workspaces':
      tr = 'workspace';
      break;
    case 'organizations':
      tr = 'organization';
      break;
    case 'users':
      tr = 'individual user';
      break;
    case 'shared-models':
      tr = 'shared CAD model';
      break;
  }
  return tr;
}

const { User, Organization, Workspace, SharedModel, Model } = models.api;

export function buildNavUrl(nav) {
  let url = "/404";
  switch (nav.target) {
    case User.servicePath:
      url = `/user/${nav.username}`;
      break;
    case Organization.servicePath:
      url = `/org/${nav.orgname}`;
      break;
    case Workspace.servicePath:
      if (nav.orgname) {
        url = `/org/${nav.orgname}/workspace/${nav.wsname}`;
      } else {
        url = `/user/${nav.username}/workspace/${nav.wsname}`;
      }
      break;
    case SharedModel.servicePath:
      url = `/share/${nav.sharelinkid}`;
      break;
    case Model.servicePath:
      url = `/model/${nav.modelid}`;
      break;
    case 'ondsel':
      url = "/";
      break;
  }
  return url;
}

// - users: /user/:slug                         -> slug renamed username
// - organizations: /org/:slug                  -> slug renamed orgname
// - workspaces: /user/:slug/workspace/:wsname  -> slug renamed username
// - workspaces: /org/:slug/workspace/:wsname   -> slug renamed orgname
// - shared-models: /share/:id                  -> id renamed sharelinkid
// - models: /model/:id                         -> id renamed to modelid
export function buildNavRoute(nav) {
  let page = { name: 'PageNotFound' }
  switch (nav.target) {
    case User.servicePath:
      page = { name: 'UserHome', params: {slug: nav.username}}
      break;
    case Organization.servicePath:
      page = { name: 'OrganizationHome', params: {slug: nav.orgname}};
      break;
    case Workspace.servicePath:
      if (nav.orgname) {
        page = { name: 'OrgWorkspaceHome', params: {slug: nav.orgname, wsname: nav.wsname}};
      } else {
        page = { name: 'UserWorkspaceHome', params: {slug: nav.username, wsname: nav.wsname}};
      }
      break;
    case SharedModel.servicePath:
      page = { name: 'Share', params: {id: nav.sharelinkid}};
      break;
    case Model.servicePath:
      page = { name: 'Home', params: {id: nav.modelid}};
      break;
    case 'ondsel':
      page = { name: 'LensHome' };
      break;
  }
  return page;
}
