import Vuex from 'vuex';
import auth from './store.auth'
import user from './services/users';
import model from './services/models';
import sharedModel from './services/sharedModel';

const store =  new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [user, auth, model, sharedModel]
})


export const resetStores = () => {
  store.commit('users/clearAll');
  store.commit('models/clearAll');
  store.commit('shared-models/clearAll');
};

export default store;
