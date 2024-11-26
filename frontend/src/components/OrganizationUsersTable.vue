<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-data-table
    v-if="organization"
    :headers="headers"
    :items="organization.users"
    :sort-by="[{ key: 'name', order: 'asc' }]"
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
          color="secondary"
          variant="elevated"
          class="mb-2"
          :hidden="!isLoggedInUserAdmin(organization)"
          @click="() => $refs.inviteUserDialog.openDialog()"
        >
          Invite new user
        </v-btn>
      </v-toolbar>
    </template>
    <template #item.isAdmin="{ item }">
      <div class="text-capitalize">
        {{ item.isAdmin }}
        &nbsp; &nbsp;
        <span v-if="item._id===organization.owner._id">
          <v-icon size="small">
              mdi-account-key
          </v-icon>
          <v-tooltip
            text="Owner of organization"
            activator="parent"
            location="top"
          >
          </v-tooltip>
        </span>
      </div>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        @click="openEditUserDialog(item)"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
  <invite-user-dialog ref="inviteUserDialog" :organization="organization" />
  <organization-user-dialog ref="organizationUserDialog" :organization="organization" :user="activeUser" />
</template>

<script>
import { mapGetters } from 'vuex';
import InviteUserDialog from '@/components/InviteUserDialog.vue';
import OrganizationUserDialog from '@/components/OrganizationUserDialog.vue';

export default {
  name: "OrganizationUsersTable",
  props: {
    organization: Object,
  },
  components: { InviteUserDialog, OrganizationUserDialog },
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
        sortable: true,
        key: 'username'
      },
      {
        title: 'Admin',
        sortable: true,
        key: 'isAdmin'
      },
      {
        title: 'Actions',
        align: 'end',
        key: 'actions',
        sortable: false
      },
    ],
    activeUser: undefined,
  }),
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
  },
  methods: {
    openEditUserDialog(userSubDocs) {
      this.activeUser = userSubDocs;
      this.$refs.organizationUserDialog.openDialog();
    }
  }
}
</script>

<style scoped>

</style>
