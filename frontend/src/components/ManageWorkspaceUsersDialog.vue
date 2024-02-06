<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Update Users of Workspace</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <v-data-table-virtual
          v-model="selected"
          :headers="headers"
          :items="organization.users"
          height="400"
          item-value="_id"
          fixed-header
          show-select
        ></v-data-table-virtual>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn :disabled="isPatchPending" @click="this.dialog = false;">Close</v-btn>
        <v-btn
          color="primary"
          :disabled="isPatchPending"
          :loading="isPatchPending"
          @click="updateWorkspaceUsers"
        >Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Workspace } = models.api;

export default {
  name: "ManageWorkspaceUsersDialog",
  props: {
    workspace: Object,
    organization: Object,
  },
  data: (vm) => ({
    dialog: false,
    selectedIds: null,
    headers: [
      {
        title: 'Name',
        align: 'start',
        sortable: true,
        key: 'name',
      },
      {
        title: 'Username',
        sortable: true,
        key: 'username',
      },
    ],
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
    workspaceUsers: vm => vm.workspace.groupsOrUsers.filter(groupOrUser => groupOrUser.type === 'User') || [],
    selected: {
      get() {
        if (!this.selectedIds) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.selectedIds = this.workspace.groupsOrUsers.filter(groupOrUser => groupOrUser.type === 'User').map(groupOrUser => groupOrUser.groupOrUser._id) || [];
        }
        return this.selectedIds;
      },
      set(value) {
        // hack to avoid delete workspace owner even if user disable checkbox.
        if (!value.includes(this.workspace.createdBy)) {
          value.push(this.workspace.createdBy);
        }
        this.selectedIds = value;
      }
    },
  },
  methods: {
    async updateWorkspaceUsers(){
      const usersToAdd = this.selected.filter(id => !this.workspaceUsers.map(groupOrUser => groupOrUser.groupOrUser._id).includes(id));
      const usersToRemove = this.workspaceUsers.map(groupOrUser => groupOrUser.groupOrUser._id).filter(id => !this.selected.includes(id));

      if (usersToAdd.length) {
        await this.workspace.patch({
          data: {
            shouldAddGroupsOrUsersToWorkspace: true,
            groupsOrUsersData: usersToAdd.map(id => ['User', 'read', id])
          }
        })
      }

      if (usersToRemove.length) {
        await this.workspace.patch({
          data: {
            shouldRemoveGroupsOrUsersFromWorkspace: true,
            groupsOrUsersIds: usersToRemove,
          }
        })
      }
      this.dialog = false;
    }
  }
}
</script>

<style scoped>

</style>
