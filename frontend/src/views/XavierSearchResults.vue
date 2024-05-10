<template>
  <v-card class="mx-auto" max-width="896" flat>
    <v-card-title>Xavier Search Results</v-card-title>
    <v-card-subtitle>
      <v-btn
        density="default"
        icon="mdi-home"
        color="success"
        @click="$router.push({ name: 'XavierMenu', params: {}})"
      ></v-btn> <b><i>Professor Xavier's School For The Hidden</i></b>
    </v-card-subtitle>
    <v-card-text>
      <p>
        {{searchText}}
        <v-btn
          icon
          @click="$refs.searchPopupDialogXavier.$data.dialog = true;"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </p>
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
            :key="entry.curation._id"
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
                @click.stop="goToEntry(entry)"
              >
                <v-card-text>
                  <curated-item-sheet :curation="entry.curation" :message="entry.notation.message"></curated-item-sheet>
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
import SearchPopupDialog from "@/components/SearchPopupDialog.vue";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";
const { Keywords } = models.api;

export default {
  name: 'XavierSearchResults',
  components: {CuratedItemSheet, SearchPopupDialog},
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
          if (curation?.nav?.username) {
            user = await this.getUserByIdOrNamePublic(curation?.nav.username);
            detail += `        id: ${user._id}\n`;
            detail += `      tier: ${user.tier}\n`;
            detail += `  username: ${user.username}\n`;
          } else {
            detail += `        id: ${user._id}\n`;
            detail += `   (curation nav object lacking proper detail)\n`;
          }
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
    async goToEntry(entry) {
      const curation = entry.curation;
      const nav = curation.nav;
      switch (nav.target) {
        case 'workspaces':
          if (nav.username) {
            this.$router.push({ name: 'UserWorkspaceHome', params: { slug: nav.username, wsname: nav.wsname } });
          } else {
            this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: nav.orgname, wsname: nav.wsname } });
          }
          break;
        case 'organizations':
          this.$router.push({ name: 'OrganizationHome', params: { slug: nav.orgname } });
          break;
        case 'users':
          this.$router.push({ name: 'UserHome', params: { slug: nav.username } });
          break;
        case 'shared-models':
          this.$router.push({ name: 'Share', params: { id: nav.sharelinkid } })
          break;
        case 'models':
          this.$router.push({ name: 'Home', params: { id: nav.modelid } })
          break;
        case 'ondsel': // not sure why this would ever show up; but for completeness...
          this.$router.push({ name: 'LensHome' } )
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
