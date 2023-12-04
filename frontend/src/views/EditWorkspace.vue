<template>
  <v-container v-if="workspace">
    <v-row>
      <div class="text-body-1">Workspace&nbsp;</div>
      <div class="text-body-1 font-weight-bold">{{ workspace.name }}</div>
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

const { Workspace } = models.api;

export default {
  name: "EditWorkspace",
  components: {ManageWorkspaceGroupsTable, ManageWorkspaceUsersTable },
  async created() {
    await Workspace.get(this.$route.params.id);
  },
  computed: {
    workspace: vm => Workspace.getFromStore(vm.$route.params.id),
  }
}
</script>

<style scoped>

</style>
