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
        <curated-item-sheet :curation="entry.curation" :message="entry.notation.message"></curated-item-sheet>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script>

import {mapActions} from "vuex";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";

export default {
  name: "PromotionsViewer",
  components: {CuratedItemSheet},
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
}
</script>

<style scoped>

</style>
