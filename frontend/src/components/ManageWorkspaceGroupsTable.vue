<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-data-table
    v-if="workspace"
    :headers="headers"
    :items="workspaceGroups"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Groups</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          variant="elevated"
          class="mb-2"
          :hidden="!isLoggedInUserAdmin(organization)"
          @click="openManageWorkspaceGroupsDialog"
        >
          Add/Remove Groups
        </v-btn>
      </v-toolbar>
      <v-progress-linear indeterminate v-if="isPatchPending"></v-progress-linear>
    </template>
    <template #item.name="{ item }">
      {{ item.groupOrUser.name }}
    </template>
    <template #item.permission="{ item }">
      <v-combobox
        v-model="item.permission"
        :items="['read', 'write']"
        variant="plain"
        append-icon="mdi-check"
        :disabled="!isLoggedInUserAdmin(organization)"
        @click:append="updatePermission(item)"
      />
    </template>
  </v-data-table>
  <manage-workspace-groups-dialog ref="mangeWorkspaceGroupDialog" :workspace="workspace" :organization="organization" />
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';
import ManageWorkspaceGroupsDialog from '@/components/ManageWorkspaceGroupsDialog.vue';

const { Workspace, Organization } = models.api;

export default {
  name: "ManageWorkspaceGroupsTable",
  props: {
    workspace: Object,
  },
  components: { ManageWorkspaceGroupsDialog },
  data: () => ({
    headers: [
      {
        title: 'Name',
        align: 'start',
        sortable: true,
        key: 'name',
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
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
    workspaceGroups: vm => vm.workspace.groupsOrUsers.filter(groupOrUser => groupOrUser.type === 'Group'),
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
    async openManageWorkspaceGroupsDialog() {
      if (!this.organization) {
        await Organization.get(this.workspace.organizationId);
      }
      this.$refs.mangeWorkspaceGroupDialog.$data.dialog = true;
    }
  }
}
</script>

<style scoped>

</style>
