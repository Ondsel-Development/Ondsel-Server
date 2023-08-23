import Vuex from 'vuex';
import auth from './store.auth'
import user from './services/users';
import model from './services/models';
import sharedModel from './services/sharedModel';
import accountEvent from './services/accountEvent';
import agreements from "./services/agreements";
import acceptAgreement from "@/store/services/accept-agreement";

const store =  new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [user, auth, model, sharedModel, accountEvent, agreements, acceptAgreement]
})


export const resetStores = () => {
  store.commit('users/clearAll');
  store.commit('models/clearAll');
  store.commit('shared-models/clearAll');
  store.commit('agreements/clearAll');
  store.commit('agreements/accept/clearAll');
};

export default store;
