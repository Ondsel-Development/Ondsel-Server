<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Update Users</div>
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
        <v-btn @click="this.dialog = false;">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="isPatchPending"
          @click="addUsersToGroup"
        >Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

const { Group } = models.api;


export default {
  name: "AddUsersToGroupDialog",
  props: {
    group: Object,
    organization: Object,
  },
  data: (vm) => ({
    dialog: false,
    selected: vm.group.users ? vm.group.users.map(user => user._id) : [],
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
    ...mapState('groups', ['isPatchPending']),
  },
  methods: {
    activeDialog() {
      this.selected = this.group.users.map(user => user._id);
      this.dialog = true;
    },
    async addUsersToGroup() {
      await Group.patch(
        this.group._id,
        {
          shouldAddUsersToGroup: true,
          userIds: this.selected,
        }
      )
      const notSelectedUsers = this.group.users.filter(user => !this.selected.includes(user._id));
      await Group.patch(
        this.group._id,
        {
          shouldRemoveUsersFromGroup: true,
          userIds: notSelectedUsers.map(user => user._id),
        }
      )
      this.dialog = false;
    }
  },
}
</script>

<style scoped>

</style>
