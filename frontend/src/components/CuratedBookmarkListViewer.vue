<template>
  <v-sheet class="d-flex flex-wrap">
    <v-sheet
      v-for="entry in displayList"
      :key="entry.curation._id"
    >
      <v-sheet>
        <v-sheet
          min-width="22em"
          max-width="40em"
          class="ma-2 align-self-stretch"
          link
          @click.stop="goToItem(entry.curation)"
        >
          <curated-item-sheet :curation="entry.curation" :message="entry.description" :from-user="entry.createdBy" :from-org="entry.onBehalfOf" :from-date="entry.createdAt"></curated-item-sheet>
        </v-sheet>
      </v-sheet>
      <v-sheet>
        <p class="text-right">
          <v-icon icon="mdi-pencil" class="mx-2"></v-icon>
          <v-icon icon="mdi-delete" class="mx-2"></v-icon>
        </p>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script>

import CuratedItemSheet from "@/components/CuratedItemSheet.vue";

export default {
  name: "CuratedBookmarkListViewer",
  components: {CuratedItemSheet},
  props: {
    displayList: Array,
    allowEdits: {type: Boolean, default: false},
  },
  async created() {
  },
  computed: {
  },
  data: () => ({
  }),
  methods: {
    async goToItem(curation) {
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
