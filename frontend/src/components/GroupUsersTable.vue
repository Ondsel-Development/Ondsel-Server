<template>
  <v-data-table
    v-if="group"
    :headers="headers"
    :items="group.users"
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
          @click="openAddUsersToGroupDialog"
        >
          Add / Remove User
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
  <add-users-to-group-dialog ref="addUsersToGroupDialog" :group="group" :organization="organization" />
</template>

<script>
import { mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';
import AddUsersToGroupDialog from '@/components/AddUsersToGroupDialog.vue';

const { Organization } = models.api;

export default {
  name: "GroupUsersTable",
  props: {
    group: Object,
  },
  components: { AddUsersToGroupDialog },
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
    ],
  }),
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
    organization: vm => Organization.getFromStore(vm.group.organizationId),
  },
  methods: {
    async openAddUsersToGroupDialog() {
      await Organization.get(this.group.organizationId);
      this.$refs.addUsersToGroupDialog.activeDialog();
    }
  }
}
</script>

<style scoped>

</style>
