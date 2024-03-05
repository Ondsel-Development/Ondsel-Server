<template>
  <v-card class="mx-auto" max-width="896" flat>
    <v-card-title>Search Results</v-card-title>
    <v-card-subtitle>{{searchText}}</v-card-subtitle>
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
            <v-sheet
              class="mx-auto"
              link
              @click.stop="goToPromoted(entry.curation)"
            >
              <v-card-text>
                <one-promotion-sheet :curation="entry.curation" :message="entry.notation.message"></one-promotion-sheet>
              </v-card-text>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>

import {mapActions, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import OnePromotionSheet from "@/components/OnePromotionSheet.vue";
const { Keywords } = models.api;

export default {
  name: 'SearchResults',
  components: {OnePromotionSheet},
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
              message: match.score.toString(),
            },
            curation: match.curation,
          };
          this.results.push(fakePromo);
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
      if (to.name === 'SearchResults') {
        await this.doSearch();
      }
    }
  }
}
</script>

<style scoped>

</style>
