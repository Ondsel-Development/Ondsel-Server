import Vuex from 'vuex';
import auth from './store.auth'
import user from './services/users';
import model from './services/models';
import sharedModel from './services/sharedModel';
import accountEvent from './services/accountEvent';
import agreements from "./services/agreements";

const store =  new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [user, auth, model, sharedModel, accountEvent, agreements]
})


export const resetStores = () => {
  store.commit('users/clearAll');
  store.commit('models/clearAll');
  store.commit('shared-models/clearAll');
  store.commit('agreements/clearAll');
};

export default store;
