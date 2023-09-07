import Vuex from 'vuex';
import auth from './store.auth'
import user from './services/users';
import model from './services/models';
import sharedModel from './services/sharedModel';
import accountEvent from './services/accountEvent';
import agreements from "./services/agreements";
import acceptAgreement from "@/store/services/accept-agreement";
import file from "@/store/services/file";

const store =  new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [user, auth, model, sharedModel, accountEvent, agreements, acceptAgreement, file]
})


export const resetStores = () => {
  store.commit('users/clearAll');
  store.commit('models/clearAll');
  store.commit('shared-models/clearAll');
  store.commit('agreements/clearAll');
};

export default store;
