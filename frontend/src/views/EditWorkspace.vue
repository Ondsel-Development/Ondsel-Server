<template>
  <v-container v-if="workspace">
    <v-row align="center">
      <div class="text-body-1">Workspace&nbsp;</div>
      <v-btn
        flat
        variant="plain"
        class="text-body-1 font-weight-bold pa-0"
        style="text-decoration: none;"
        @click="$router.push({ name: 'WorkspaceHome', params: { id: workspace._id } })"
      >
        {{ workspace.name }}
      </v-btn>
    </v-row>
    <v-row class="mt-12">
      <manage-workspace-users-table v-if="isOrgWorkspace" :workspace="workspace" />
      <div v-else><i>personal workspaces limited to self</i></div>
    </v-row>
    <v-row class="mt-12">
      <manage-workspace-groups-table v-if="isOrgWorkspace" :workspace="workspace" />
      <div v-else><i>personal workspaces do not support groups</i></div>
    </v-row>
  </v-container>
</template>

<script>
import { models } from '@feathersjs/vuex';
import ManageWorkspaceUsersTable from '@/components/ManageWorkspaceUsersTable.vue';
import ManageWorkspaceGroupsTable from '@/components/ManageWorkspaceGroupsTable.vue';
import {mapActions, mapGetters} from 'vuex';

const { Workspace, Organization } = models.api;

export default {
  name: "EditWorkspace",
  components: { ManageWorkspaceGroupsTable, ManageWorkspaceUsersTable },
  async created() {
    try {
      await Workspace.get(this.$route.params.id);
    } catch (e) {
      this.$router.push({ name: 'PageNotFound' });
    }
    if (!this.organization) {
      await Organization.get(this.workspace.organizationId);
    }
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      const organization = Organization.getFromStore(this.workspace.organizationId);
      await this.setCurrentOrganization(organization);
    }
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    workspace: vm => Workspace.getFromStore(vm.$route.params.id),
    organization: vm => Organization.getFromStore(vm.workspace.organizationId),
    isOrgWorkspace: vm => vm.$route.params.orgName !== undefined,
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
  }
}
</script>

<style scoped>

</style>
