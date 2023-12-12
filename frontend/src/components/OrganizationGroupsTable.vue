<template>
  <v-data-table
    v-if="organization"
    :headers="headers"
    :items="organization.groups"
    :sort-by="[{ key: 'name', order: 'asc' }]"
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
          dark
          class="mb-2"
          :hidden="!isLoggedInUserAdmin(organization)"
          @click="$refs.createGroupDialog.$data.dialog = true;"
        >
          Add Group
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        @click="$router.push({ name: 'EditGroup', params: { id: item.value._id } })"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
  <create-group-dialog ref="createGroupDialog" :organization="organization" />
</template>

<script>
import { mapGetters } from 'vuex';
import CreateGroupDialog from '@/components/CreateGroupDialog.vue';

export default {
  name: "OrganizationGroupsTable",
  props: {
    organization: Object,
  },
  components: { CreateGroupDialog },
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
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
