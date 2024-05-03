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
                v-model="userSelected"
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
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn class="primary" :disabled="disableShare" @click="sendShare()">Send Share</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {mapActions, mapGetters, mapState} from "vuex";
import {translateCollection} from "@/curationHelpers";
import {models} from "@feathersjs/vuex";

// const { Organization, OrgSecondaryReference } = models.api;
const { Keywords } = models.api;

export default {
  name: 'ShareWithUserDialog',
  props: {
    curation: Object,
  },
  async created() {
    await this.reCalc();
  },
  data: () => ({
    dialog: false,
    message: '',
    userId: null,
    snackerMsg: '',
    showSnacker: false,
    isPatchPending: false,
    longCollectionDesc: 'tbd',
    searchResult: [],
    searchString: '',
    userSelected: null,
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    disableShare: vm => vm.userSelected === null || vm.isPatchPending,
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async reCalc() {
      this.longCollectionDesc = translateCollection(this.curation.collection);
    },
    async sendShare() {
      // TODO
      console.log(this.userSelected);
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
