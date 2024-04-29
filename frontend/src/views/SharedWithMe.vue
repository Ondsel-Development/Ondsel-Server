<template>
  <v-container>
    <v-card elevation="0">
      <v-card-title>Shared With Me</v-card-title>
      <v-card-text>
        <curated-bookmark-list-viewer :display-list="orgSecondaryReferences?.sharedWithMe || []" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {mapGetters, mapState} from 'vuex';
import CuratedBookmarkListViewer from "@/components/CuratedBookmarkListViewer.vue";

const { Organization, OrgSecondaryReference } = models.api;

export default {
  name: "SharedWithMe",
  components: {CuratedBookmarkListViewer},
  data() {
    return {
      orgSecondaryReferences: null
    };
  },
  computed: {
    ...mapState('org-secondary-references', { isFindPendingOrgSecRefs: 'isFindPending' }),
    ...mapGetters('app', { organizationSummary: 'currentOrganization' }),
  },
  async mounted() {
    const org = await Organization.get(this.organizationSummary._id);
    this.orgSecondaryReferences = await OrgSecondaryReference.get(org.orgSecondaryReferencesId);
  },
  methods: {
  },
}
</script>

<style scoped>

</style>
