import Vuex from 'vuex';
import auth from './store.auth'
import user from './services/users';

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  plugins: [user, auth]
})
