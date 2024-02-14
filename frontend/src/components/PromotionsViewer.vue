<template>
  <v-row class="mt-6">
    <v-col
      cols="6"
      v-for="entry in promoted"
      :key="entry.curation._id"
    >
      <v-card
        class="mx-auto"
        variant="elevated"
        link
        @click.stop="goToPromoted(entry.curation)"
      >
        <v-card-title>
          <p class="text-blue-accent-1">{{entry.notation.message}}</p>
        </v-card-title>
        <v-card-subtitle>
          {{translateCollection(entry.curation.collection)}}
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <repr-viewer :curation="entry.curation"/>
            </v-col>
            <v-col cols="8">
              <p class="text-h6">{{ entry.curation.name }}</p>
              <span class="text-body-2">{{ entry.curation.description }}</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import ReprViewer from "@/components/ReprViewer.vue";
import {mapActions} from "vuex";

export default {
  name: "PromotionsViewer",
  components: {ReprViewer},
  props: {
    promoted: Array,
  },
  async created() {
  },
  computed: {
  },
  data: () => ({
  }),
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async goToPromoted(curation) {
      let workspace;
      let org;
      switch (curation.collection) {
        case 'workspaces':
          workspace = await this.getWorkspaceByIdPublic(curation._id);
          org = await this.getOrgByIdOrNamePublic(workspace.organizationId);
          if (org.type === 'Personal') {
            this.$router.push({ name: 'UserWorkspaceHome', params: { slug: org.owner.username, wsname: workspace.refName } });
          } else {
            this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: org.refName, wsname: workspace.refName } });
          }
          break;
        case 'organizations':
          break;
      }
    },
    translateCollection(collection) {
      let tr = '';
      switch (collection) {
        case 'workspaces':
          tr = 'an open workspace';
          break;
        case 'organizations':
          tr = 'an organization';
          break;
      }
      return tr;
    }
  },
}
</script>

<style scoped>

</style>
