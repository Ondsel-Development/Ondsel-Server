<template>
  <Main>
    <template #title>
      <v-icon icon="mdi-inbox" />
      Shared With Me
    </template>
    <template #content>
      <v-card elevation="0">
        <v-card-text>
          <curated-bookmark-list-viewer :display-list="orgSecondaryReferences?.sharedWithMe || []" />
        </v-card-text>
      </v-card>
    </template>
  </Main>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {mapState} from 'vuex';
import CuratedBookmarkListViewer from "@/components/CuratedBookmarkListViewer.vue";
import Main from '@/layouts/default/Main.vue';

const { Organization, OrgSecondaryReference } = models.api;

export default {
  name: "SharedWithMe",
  components: {Main, CuratedBookmarkListViewer},
  data() {
    return {
      orgSecondaryReferences: null
    };
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  async mounted() {
    const user = this.loggedInUser.user;
    const org = await Organization.get(user.personalOrganization._id);
    this.orgSecondaryReferences = await OrgSecondaryReference.get(org.orgSecondaryReferencesId);
  },
  methods: {
  },
}
</script>

<style scoped>

</style>
