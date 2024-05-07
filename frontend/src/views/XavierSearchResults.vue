<template>
  <v-card class="mx-auto" max-width="896" flat>
    <v-card-title>Xavier Search Results</v-card-title>
    <v-card-subtitle>{{searchText}}
      <v-btn
        icon
        @click="$refs.searchPopupDialogXavier.$data.dialog = true;"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-card-subtitle>
    <v-card-text>
      <v-container class="flex-column">
        <v-row>
          <v-col
            cols="12"
            v-if="results.length===0"
          >
            <i>No results found.</i>
          </v-col>
          <v-col
            cols="12"
            v-for="entry in results"
          >
            <v-sheet>
              <v-sheet>
                <v-expansion-panels>
                  <v-expansion-panel title="Get Detail" @click.stop="getDetail(entry.curation)">
                    <v-expansion-panel-text>
                      <pre>{{entry.admin_details}}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-sheet>
              <v-sheet
                class="mx-auto"
                link
                @click.stop="goToPromoted(entry.curation)"
              >
                <v-card-text>
                  <one-promotion-sheet :curation="entry.curation" :message="entry.notation.message"></one-promotion-sheet>
                </v-card-text>
              </v-sheet>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <search-popup-dialog ref="searchPopupDialogXavier" dest-page-name="XavierSearchResults"></search-popup-dialog>
</template>

<script>

import {mapActions, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import OnePromotionSheet from "@/components/OnePromotionSheet.vue";
import SearchPopupDialog from "@/components/SearchPopupDialog.vue";
const { User, Keywords } = models.api;

export default {
  name: 'XavierSearchResults',
  components: {SearchPopupDialog, OnePromotionSheet},
  data() {
    return {
      results: [], // list is stored as an array of "promotions"
      searchText: '',
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  async created() {
    await this.doSearch();
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async doSearch() {
      this.searchText = this.$route.params.text || '';
      // all the smarts are on the API side. a "single simple word" works as expected, but anything else
      // returns a highly-tuned derived result.
      this.results = [];
      let tempResults = null;
      try {
        tempResults = await Keywords.find({
          query: {
            text: this.searchText,
          },
        });
      } catch (e) {
        console.log(e.message);
      }
      if (tempResults && tempResults.total > 0) {
        for (const match of tempResults.data[0].sortedMatches) {
          const fakePromo = {
            notation: {
              updatedAt: Date.now(), // not used
              historicUser: {}, // not used
              message: '',
            },
            curation: match.curation,
            admin_details: 'tbd',
          };
          this.results.push(fakePromo);
        }
      }
    },
    async getDetail(curation) {
      let detail = `collection: ${curation.collection}\n`;
      let user;
      switch (curation.collection) {
        case 'workspaces':
          break;
        case 'organizations':
          break;
        case 'users':
          user = await User.get(curation._id);
          detail += `        id: ${user._id}\n`;
          detail += `      tier: ${user.tier}\n`;
          detail += `  username: ${user.username}\n`;
          detail += `     email: ${user.email}\n`;
          break;
        case 'shared-models':
          break;
      }

      for (const idx in this.results) {
        if (this.results[idx].curation._id === curation._id) {
          this.results[idx].admin_details = detail;
        }
      }
    },
    async goToPromoted(curation) {
      let workspace;
      let org;
      let user;
      switch (curation.collection) {
        case 'workspaces':
          workspace = await this.getWorkspaceByIdPublic(curation._id);
          if (!workspace) {
            console.log(`cannot find workspace ${curation._id}`);
            return;
          }
          org = await this.getOrgByIdOrNamePublic(workspace.organizationId);
          if (org.type === 'Personal') {
            this.$router.push({
              name: 'UserWorkspaceHome',
              params: {slug: org.owner.username, wsname: workspace.refName}
            });
          } else {
            this.$router.push({name: 'OrgWorkspaceHome', params: {slug: org.refName, wsname: workspace.refName}});
          }
          break;
        case 'organizations':
          org = await this.getOrgByIdOrNamePublic(curation._id);
          if (!org) {
            console.log(`cannot find org ${curation._id}`);
            return;
          }
          this.$router.push({name: 'OrganizationHome', params: {slug: org.refName}});
          break;
        case 'users':
          user = await this.getUserByIdOrNamePublic(curation._id);
          if (!user) {
            console.log(`cannot find user ${curation._id}`);
            return;
          }
          this.$router.push({name: 'UserHome', params: {slug: user.username}});
          break;
        case 'shared-models':
          this.$router.push({name: 'Share', params: {id: curation._id.toString()}})
          break;
      }

    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'XavierSearchResults') {
        await this.doSearch();
      }
    }
  }
}
</script>

<style scoped>

</style>
