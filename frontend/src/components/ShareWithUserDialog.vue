<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card max-width="40em" min-width="22em">
      <v-card-title>Share {{curation.name}}</v-card-title>
      <v-card-subtitle>
        {{longCollectionDesc}} to user
      </v-card-subtitle>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form>
        <v-card>
          <v-card-title>Locate User</v-card-title>
          <v-card-text>
            <v-text-field v-model="searchString" hint="Enter words or names to search by" autofocus></v-text-field>
            <v-divider></v-divider>
            <v-sheet class="ma-1 pl-2 overflow-y-auto" border height="20em">
              <v-radio-group
                v-model="userIdSelected"
                v-for="person in searchResult"
                :key="person.username"
              >
                <v-radio :value="person.id">
                  <template v-slot:label>
                    {{ person.name }} &nbsp; <code>[{{ person.username }}]</code>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-sheet>
          </v-card-text>
        </v-card>
        <v-text-field label="optional message" v-model="message" hint="provide details or context for the receiving user"></v-text-field>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="disableShare"
          @click="sendShare()"
        >Send Share</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {mapActions, mapGetters, mapState} from "vuex";
import {translateCollection} from "@/curationHelpers";
import {models} from "@feathersjs/vuex";

const { Keywords, Organization } = models.api;

export default {
  name: 'ShareWithUserDialog',
  props: {
    curation: Object,
  },
  emits: ['saveShareWithUser'],
  async created() {
    await this.reCalc();
  },
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    isPatchPending: false,
    longCollectionDesc: 'tbd',
    orgSecondaryReferencesId: null,
    searchResult: [],
    searchString: '',
    userIdSelected: null,
    message: '',
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    disableShare: vm => vm.userIdSelected === null || vm.isPatchPending,
  },
  methods: {
    // ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async reCalc() {
      const user = this.loggedInUser.user;
      const org = await Organization.get(user.personalOrganization._id);
      this.orgSecondaryReferencesId = org.orgSecondaryReferencesId;
      this.longCollectionDesc = translateCollection(this.curation.collection);
    },
    async sendShare() {
      this.$emit('saveShareWithUser');
    },
    async doSearch() {
      let users = [];
      let tempResults = null;
      try {
        tempResults = await Keywords.find({
          query: {
            text: this.searchString,
            target: 'users',
          },
        });
      } catch (e) {
        console.log(e.message);
      }
      if (tempResults && tempResults.total > 0) {
        for (const match of tempResults.data[0].sortedMatches) {
          const userDetail = {
            id: match.curation._id,
            name: match.curation.name,
            username: match.curation.slug,
          };
          users.push(userDetail);
        }
        this.searchResult = users;
      }
    }
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        await this.reCalc();
      }
    },
    async searchString(newValue) {
      if (newValue.length > 2) {
        await this.doSearch();
      }
    }
  }
}
</script>
<style scoped>
</style>
