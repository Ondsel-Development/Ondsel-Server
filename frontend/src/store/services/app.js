import { models } from '@feathersjs/vuex';


const state = {
  currentOrganization: null
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
      let result = undefined;
      let userResult;
      if (name.length === 24) {
        userResult = await models.api.User.find({
          query: {
            publicInfo: "true",
            $or: [
              {_id: name},
              {username: name},
            ]
          }
        });
      } else {
        userResult = await models.api.User.find({
          query: {
            publicInfo: "true",
            username: name,
          }
        });
      }
      if (userResult.total === 1) {
        result = userResult.data[0];
      }
      return result;
    },
    getWorkspaceByNamePrivate: async (context, name) => {
      // get the private details of workspace via refName "slug"
      let result = undefined;
      let userResult = await models.api.Workspace.find({
        query: {
          refName: name,
        }
      });
      if (userResult.total === 1) {
        result = userResult.data[0];
      }
      return result;
    },
  }
}
