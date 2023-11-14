<template>
  <v-data-table
    v-if="organization"
    :headers="headers"
    :items="Array.from({ length: 4 }, () => organization.users).flat()"
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
        >
          Invite new user
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "OrganizationUsersTable",
  props: {
    organization: Object,
  },
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
  })
}
</script>

<style scoped>

</style>
