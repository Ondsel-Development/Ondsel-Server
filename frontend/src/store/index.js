// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Vuex from 'vuex';
import auth from './store.auth'
import app from '@/store/services/app';
import user from './services/users';
import model from './services/models';
import sharedModel from './services/sharedModel';
import accountEvent from './services/accountEvent';
import agreements from "./services/agreements";
import acceptAgreement from "@/store/services/accept-agreement";
import file from "@/store/services/file";
import authManagement from "@/store/services/auth-management";
import organization from '@/store/services/organizations';
import group from '@/store/services/groups';
import orgInvite from '@/store/services/orgInvites';
import directory from '@/store/services/directories';
import workspace from '@/store/services/workspaces';
import keywords from "@/store/services/keywords";
import orgSecondaryReference from '@/store/services/orgSecondaryReferences';
import notifications from "@/store/services/notifications";
import publisher from "@/store/services/publisher";

const store =  new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app
  },
  plugins: [
    user,
    auth,
    model,
    sharedModel,
    accountEvent,
    agreements,
    acceptAgreement,
    file,
    authManagement,
    organization,
    group,
    orgInvite,
    directory,
    workspace,
    keywords,
    orgSecondaryReference,
    notifications,
    publisher,
  ]
})


export const resetStores = () => {
  store.commit('users/clearAll');
  store.commit('models/clearAll');
  store.commit('shared-models/clearAll');
  store.commit('agreements/clearAll');
  store.commit('auth-management/clearAll');
};

export default store;
