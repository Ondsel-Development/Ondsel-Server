<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="400"
  >
    <v-card max-width="40em" min-width="22em">
      <v-card-title class="text-center">Give Access to Users</v-card-title>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form>
        <v-card flat>
          <v-card-title>Locate User</v-card-title>
          <v-card-text>
            <v-text-field v-model="searchString" hint="Enter words or names to search by" autofocus></v-text-field>
            <v-divider></v-divider>
            <v-sheet class="ma-1 pl-2 overflow-y-auto" border height="20em">
              <template
                v-for="person in searchResult"
                :key="person.username"
              >
                <v-checkbox v-model="directSharedToUserIds" :value="person.id" checked density="compact" class="my-0" @change="updateSelectedData(person)">
                  <template v-slot:label>
                    {{ person.name }} &nbsp; <code>[{{ person.username }}]</code>
                  </template>
                </v-checkbox>
              </template>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-form>
      <div class="text-center">
        <v-card-subtitle>
          Users having access:
          <template v-if="sharedModel.directSharedTo.length === 0">None</template>
        </v-card-subtitle>
        <v-chip v-for="user of sharedModel.directSharedTo || []" :ripple="false" link>
          {{ user.name }} ({{ user.username }})
        </v-chip>
      </div>
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
          :disabled="isPatchPending"
          @click="sendShare()"
        >Update Access</v-btn>
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
  name: 'DirectShareToUsersDialog',
  props: {
    sharedModel: Object,
  },
  emits: ['saveShareWithUser'],
  async created() {
    await this.reCalc();
  },
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    orgSecondaryReferencesId: null,
    searchResult: [],
    searchString: '',
    directSharedToUserIds: [],
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('shared-models', ['isPatchPending']),
  },
  methods: {
    openDialog(sharedModel) {
      if (sharedModel.directSharedTo) {
        this.directSharedToUserIds = sharedModel.directSharedTo.map(user => user._id);
      }
      this.dialog = true;
    },
    updateSelectedData(person) {
      if (this.directSharedToUserIds.some(_id => _id === person.id)) {
        this.directSharedToUserIds = this.directSharedToUserIds.filter(_id => _id !== person.id);
      } else {
        this.directSharedToUserIds.push(person.id);
      }
    },
    async reCalc() {
      const user = this.loggedInUser.user;
      const org = await Organization.get(user.personalOrganization._id);
      this.orgSecondaryReferencesId = org.orgSecondaryReferencesId;
    },
    async sendShare() {
      this.sharedModel.patch({ data: { directSharedToUserIds: this.directSharedToUserIds } });
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
