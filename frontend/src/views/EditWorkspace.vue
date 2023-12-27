<template>
  <v-container v-if="workspace">
    <v-row align="center">
      <div class="text-body-1">Workspace&nbsp;</div>
      <v-btn
        flat
        variant="plain"
        class="text-body-1 font-weight-bold pa-0"
        style="text-decoration: none;"
        @click="$router.push({ name: 'WorkspaceHome', params: { stub: workspace.organization.refName, id: workspace._id } })"
      >
        {{ workspace.name }}
      </v-btn>
    </v-row>
    <v-row class="mt-12">
      <manage-workspace-users-table :workspace="workspace" />
    </v-row>
    <v-row class="mt-12">
      <manage-workspace-groups-table :workspace="workspace" />
    </v-row>
  </v-container>
</template>

<script>
import { models } from '@feathersjs/vuex';
import ManageWorkspaceUsersTable from '@/components/ManageWorkspaceUsersTable.vue';
import ManageWorkspaceGroupsTable from '@/components/ManageWorkspaceGroupsTable.vue';
import {mapActions, mapGetters} from 'vuex';

const { Organization } = models.api;

export default {
  name: "EditWorkspace",
  components: { ManageWorkspaceGroupsTable, ManageWorkspaceUsersTable },
  data: () => ({
    workspaceDetail: {groupsOrUsers:[]},
    organizationDetail: undefined,
  }),
  async created() {
    this.workspaceDetail = await this.getWorkspaceByNamePrivate(this.$route.params.wsname, this.$route.params.slug);
    if (!this.workspaceDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      if (this.currentOrganization.type !== 'Open') {
        this.$router.push({ name: 'OrganizationPermissionError', params: {slug: this.organization?.refName, urlCode: `/org/${this.organization?.refName}/workspace/${this.workspaceRefName}/edit`}})
      }
    }
    if (!this.organization) {
      this.organizationDetail = await Organization.get(this.workspace.organizationId);
    }
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
    organization: vm => vm.organizationDetail,
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization', 'getWorkspaceByNamePrivate']),
  }
}
</script>

<style scoped>

</style>
