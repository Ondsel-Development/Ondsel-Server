<template>
  <v-sheet
    width="32em"
    class="ma-2"
  >
    <v-card
      class="mx-auto"
      link
      @click.stop="goToWorkspaceHome(workspace)"
    >
      <template #title>
        <div class="text-h6">
          {{ workspace.name }}
        </div>
      </template>
      <template #subtitle>
        <span class="text-body-2">{{ workspace.description }}</span>
        <div class="text-body-2">{{ (new Date(workspace.createdAt)).toDateString() }}</div>
        <v-icon v-if="workspace.open" class="text-body-2" icon="mdi-earth" flag />
      </template>
      <template v-slot:prepend v-if="!this.$vuetify.display.mobile" >
        <repr-viewer :curation="workspace.curation"/>
      </template>
      <template v-slot:append>
        <v-btn icon="mdi-cog" flat @click.stop="goToWorkspaceEdit(workspace)"/>
      </template>
      <template v-slot:text>

      </template>
    </v-card>
  </v-sheet>
</template>

<script>

import ReprViewer from "@/components/ReprViewer.vue";

export default {
  name: 'WorkspaceViewSheet',
  components: {ReprViewer},
  props: {
    workspace: {
      Type: Object,
      default: {},
    },
    isOrg: {
      Type: Boolean,
      default: true,
    },
    username: {
      Type: String,
      default: '',
    }
  },
  data: () => ({
  }),
  async created() {
  },
  computed: {
  },
  methods: {
    async goToWorkspaceHome(workspace) {
      if (this.isOrg) {
        this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: workspace.organization.refName, wsname: workspace.refName } });
      } else {
        this.$router.push({ name: 'UserWorkspaceHome', params: { slug: this.username, wsname: workspace.refName } });
      }
    },
    async goToWorkspaceEdit(workspace) {
      if (this.isOrg) {
        this.$router.push({ name: 'OrgEditWorkspace', params: { slug: workspace.organization.refName, wsname: workspace.refName } });
      } else {
        this.$router.push({ name: 'UserEditWorkspace', params: { slug: this.username, wsname: workspace.refName } });
      }
    },
  },
  watch: {
  }
}
</script>
<style scoped>
</style>
