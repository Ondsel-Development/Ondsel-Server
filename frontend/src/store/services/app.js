import { models } from '@feathersjs/vuex';


const state = {
  currentOrganization: null
}

function isObjectId(str) {
  // Define the ObjectId pattern
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;

  // Check if the string matches the ObjectId pattern
  return objectIdPattern.test(str);
}

export default {
  namespaced: true,
  state,
  getters: {
    currentOrganization (state, getters, rootState, rootGetters) {
      if (state.currentOrganization) {
        return state.currentOrganization;
      }
      const user = rootGetters['auth/user'];
      if (user && user.currentOrganizationId) {
        const [organization] = user.organizations.filter(org => org._id === user.currentOrganizationId);
        return organization;
      }
      return null;
    }
  },
  mutations: {
    SET_CURRENT_ORGANIZATION: (stateIn, organization) => {
      stateIn.currentOrganization = organization;
    }
  },
  actions: {
    setCurrentOrganization: (context, organization) => {
      context.commit('SET_CURRENT_ORGANIZATION', organization);

      // Save to DB
      models.api.User.patch(context.rootState.auth.user._id, { currentOrganizationId: organization._id });
    },
    getOrgByIdOrNamePublic: async (context, name) => {
      // get the public details of any organization using _id or refName (slug)
      let result = undefined;
      let orgResult;
      if (name.length === 24) {
        orgResult = await models.api.Organization.find({
          query: {
            publicInfo: "true",
            $or: [
              {_id: name},
              {refName: name},
            ]
          }
        });
      } else {
        orgResult = await models.api.Organization.find({
          query: {
            publicInfo: "true",
            refName: name,
          }
        });
      }
      if (orgResult.total === 1) {
        result = orgResult.data[0];
      }
      return result;
    },
    getUserByIdOrNamePublic: async (context, name) => {
      // get the public details of any user using _id or username

      // the following flat-out does not work for user; don't know WHY; so making it two direct queries instead
      // not even non-$or queries work
      //
      const userResult = await models.api.User.find({
        query: {
          publicInfo: "true",
          "$or": [
            { username: name },
            ...(isObjectId(name) ? [{_id: name}] : [])
          ]
        }
      });
      if (userResult.total) {
        return userResult.data[0];
      }
      return undefined;
    },
    getWorkspaceByNamePrivate: async (context, detail) => {
      // get the private details of workspace via refName "slug"
      // throws error if not found

      let result = undefined;
      let wsResult
      try {
        wsResult = await models.api.Workspace.find({
          query: {
            refName: detail.wsName,
            "organization.refName": detail.orgName
          }
        })
      } catch (e) {
        console.log(`  >>> ERROR ${e}`);
        console.log(e);
      }
      if (wsResult?.total === 1) {
        result = wsResult.data[0];
      }
      return result;
    },
    getWorkspaceByIdPublic: async (context, workspaceId) => {
      // get the public details of any workspace using _id

      // the following flat-out does not work for user; don't know WHY; so making it two direct queries instead
      // not even non-$or queries work
      //
      try {
        const userResult = await models.api.Workspace.get(
          workspaceId,
          {
            query: {
              publicInfo: "true",
            }
          });
        return userResult;
      } catch (e) {
        return undefined;
      }
    },
  }
}
