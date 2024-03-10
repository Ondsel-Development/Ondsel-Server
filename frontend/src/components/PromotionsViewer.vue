<template>
  <v-sheet class="d-flex flex-wrap">
    <v-sheet
      v-for="entry in promoted"
      :key="entry.curation._id"
    >
      <v-sheet
        min-width="22em"
        max-width="40em"
        class="ma-2 align-self-stretch"
        link
        @click.stop="goToPromoted(entry.curation)"
      >
        <one-promotion-sheet :curation="entry.curation" :message="entry.notation.message"></one-promotion-sheet>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script>

import {mapActions} from "vuex";
import OnePromotionSheet from "@/components/OnePromotionSheet.vue";

export default {
  name: "PromotionsViewer",
  components: {OnePromotionSheet},
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
      let user;
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
          org = await this.getOrgByIdOrNamePublic(curation._id);
          this.$router.push({ name: 'OrganizationHome', params: { slug: org.refName } });
          break;
        case 'users':
          user = await this.getUserByIdOrNamePublic(curation._id);
          this.$router.push({ name: 'UserHome', params: { slug: user.username } });
          break;
        case 'shared-models':
          this.$router.push({ name: 'Share', params: { id: curation._id.toString() } })
          break;
      }
    },
  },
}
</script>

<style scoped>

</style>
