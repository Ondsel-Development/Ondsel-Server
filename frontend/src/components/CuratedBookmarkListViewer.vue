<template>
  <v-sheet class="d-flex flex-wrap">
    <v-sheet
      v-for="entry in displayList"
      :key="entry.curation._id"
    >
      <v-sheet
        min-width="22em"
        max-width="40em"
        class="ma-2 align-self-stretch"
        link
        @click.stop="goToPromoted(entry.curation)"
      >
        <one-promotion-sheet :curation="entry.curation" :message="entry.description"></one-promotion-sheet>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script>

import OnePromotionSheet from "@/components/OnePromotionSheet.vue";

export default {
  name: "CuratedBookmarkListViewer",
  components: {OnePromotionSheet},
  props: {
    displayList: Array,
  },
  async created() {
  },
  computed: {
  },
  data: () => ({
  }),
  methods: {
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
