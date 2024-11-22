<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

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
              @click.stop="goToEntry(entry)"
            >
              <v-card-text>
                <curated-item-sheet :curation="entry.curation" :message="entry.notation.message"></curated-item-sheet>
              </v-card-text>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";
const { Keywords } = models.api;

export default {
  name: 'SearchResults',
  components: {CuratedItemSheet},
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
              message: '', // match.score.toString(),
            },
            curation: match.curation,
          };
          this.results.push(fakePromo);
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
      if (to.name === 'SearchResults') {
        await this.doSearch();
      }
    }
  }
}
</script>

<style scoped>

</style>
