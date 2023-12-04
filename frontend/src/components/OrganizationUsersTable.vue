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
          dark
          class="mb-2"
          @click="$refs.inviteUserDialog.$data.dialog = true;"
        >
          Invite new user
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        @click="openEditUserDialog(item.value)"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
  <invite-user-dialog ref="inviteUserDialog" :organization="organization" />
  <organization-user-dialog ref="organizationUserDialog" :organization="organization" :user="activeUser" />
</template>

<script>
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
        title: 'Actions',
        align: 'end',
        key: 'actions',
        sortable: false
      },
    ],
    activeUser: undefined,
  }),
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
