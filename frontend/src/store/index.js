import Vuex from 'vuex';
import auth from './store.auth'
import user from './services/users';
import model from './services/models';
import upload from './services/upload';

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [user, auth, model, upload]
})
