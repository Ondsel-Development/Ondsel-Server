import { models } from '@feathersjs/vuex';


const state = {
  currentOrganization: null
}

export default {
  namespaced: true,
  state,
  getters: {
    currentOrganization: s => s.currentOrganization,
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
    }
  }
}
