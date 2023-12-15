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
    },
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
    getOrganizationByName: async (context, name) => {
      let result = undefined;
      const orgResult = await models.api.Organization.find({
        query: {
          refName: name,
        }
      });
      if (orgResult.total !== 0) {
        let orgId = orgResult.data[0]._id;
        result = await models.api.Organization.get(orgId);
      }
      return result;
    },
    getUserByName: async (context, name) => {
      // note: this function only gets the data available to the public; email etc. is missing
      let result = undefined;
      const targetUser = await models.api.User.find({
        query: {username: name }
      })
      if (targetUser.total !== 0) {
        result = targetUser.data[0];
      }
      return result;
    }
  }
}
