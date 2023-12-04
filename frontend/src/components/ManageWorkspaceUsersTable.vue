<template>
  <v-data-table
    v-if="workspace"
    :headers="headers"
    :items="workspaceUsers"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Users</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-btn
          dark
          class="mb-2"
          @click="openManageWorkspaceUsersDialog"
        >
          Add/Remove Users
        </v-btn>
      </v-toolbar>
      <v-progress-linear indeterminate v-if="isPatchPending"></v-progress-linear>
    </template>
    <template #item.name="{ item }">
      {{ item.value.groupOrUser.name }}
    </template>
    <template #item.username="{ item }">
      {{ item.value.groupOrUser.username }}
    </template>
    <template #item.permission="{ item }">
      <v-combobox
        v-model="item.value.permission"
        :items="['read', 'write']"
        variant="plain"
        append-icon="mdi-check"
        @click:append="updatePermission(item.value)"
      />
    </template>
  </v-data-table>
  <manage-workspace-users-dialog ref="mangeWorkspaceUserDialog" :workspace="workspace" :organization="organization" />
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import ManageWorkspaceUsersDialog from '@/components/ManageWorkspaceUsersDialog.vue';

const { Workspace, Organization } = models.api;

export default {
  name: "ManageWorkspaceUsersTable",
  props: {
    workspace: Object,
  },
  components: { ManageWorkspaceUsersDialog },
  data: () => ({
    headers: [
      {
        title: 'Name',
        align: 'start',
        sortable: true,
        key: 'name',
      },
      {
        title: 'Username',
        align: 'start',
        sortable: true,
        key: 'username'
      },
      {
        title: 'Permission',
        align: 'start',
        key: 'permission',
        sortable: true
      }
    ],
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
    workspaceUsers: vm => vm.workspace.groupsOrUsers.filter(groupOrUser => groupOrUser.type === 'User'),
    organization: vm => Organization.getFromStore(vm.workspace.organizationId),
  },
  methods: {
    async updatePermission(data) {
      await this.workspace.patch({
        data: {
          shouldAddGroupsOrUsersToWorkspace: true,
          groupsOrUsersData: [
            [data.type, data.permission, data.groupOrUser._id]
          ]
        }
      })
    },
    async openManageWorkspaceUsersDialog() {
      if (!this.organization) {
        await Organization.get(this.workspace.organizationId);
      }
      this.$refs.mangeWorkspaceUserDialog.$data.dialog = true;
    }
  }
}
</script>

<style scoped>

</style>
