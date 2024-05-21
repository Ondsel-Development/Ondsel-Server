<template>
  <v-data-table
    :items="user.organizations"
    :headers="headers"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Organizations</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          :hidden="!user.constraint.canCreatePrivateOrganization && !user.constraint.canCreateOpenOrganization"
          :to="{ name: 'CreateOrganization'}"
        >Create Organization</v-btn>
      </v-toolbar>
    </template>
    <template #item="{ item }">
      <tr>
        <td>{{ item.name }}</td>
        <td>{{ item.type }}</td>
        <td>
          {{ item.notificationByEmailCadence || "Immediately" }}
          <v-icon
            size="small"
            @click.stop="openNotificationByEmailCadenceDialog(item)"
          >
            mdi-pencil
          </v-icon>
        </td>
      </tr>
    </template>
  </v-data-table>
  <generic-selection-dialog
    :currentSelection="notificationCadenceSelection"
    :selectionList="notificationCadenceOptions"
    :title="notificationCadenceTitle"
    :subtitle="notificationCadenceSubTitle"
    ref="notificationByEmailCadenceDialog"
    @save-generic-selection="saveNotificationByEmailCadenceSelection"
  ></generic-selection-dialog>
</template>

<script>
import {mapState} from "vuex";
import GenericSelectionDialog from "@/components/GenericSelectionDialog.vue";
import {models} from "@feathersjs/vuex";

const { User } = models.api;

export default {
  name: "OrganizationMembershipTable",
  components: {GenericSelectionDialog},
  data: () => ({
    headers: [
      {
        title: 'Name',
        align: 'start',
        sortable: true,
        key: 'name',
        value: 'name',
      },
      {
        title: 'Type',
        sortable: true,
        key: 'type',
        value: 'type',
      },
      {
        title: 'Send Email Notifications',
        sortable: true,
        key: 'notificationByEmailCadence',
        value: 'notificationByEmailCadence',
      }
    ],
    notificationCadenceOptions: [
      {'order': 'a', 'label': 'Immediately: send an email as soon as the notification arrives', 'value': 'Immediately'},
      {'order': 'b', 'label': 'Never: never send an email for notifications', 'value': 'Never'},
    ],
    notificationCadenceTitle: '',
    notificationCadenceSubTitle: '',
    notificationCadenceSelection: '',
    notificationCadenceOrgId: null,
  }),
  computed: {
    ...mapState('auth', ['user']),
  },
  methods: {
    async openNotificationByEmailCadenceDialog(item) {
      this.notificationCadenceSelection = item.notificationByEmailCadence || "Immediately";
      if (item.type === 'Personal') {
        this.notificationCadenceTitle = `Email handling for you (${item.name})`
      } else {
        this.notificationCadenceTitle = `Email handling for org "${item.name}"`
      }
      this.notificationCadenceSubTitle = `When should you get notification emails at ${this.user.email}?`;
      this.notificationCadenceOrgId = item._id;
      this.$refs.notificationByEmailCadenceDialog.$data.finalSelection = this.notificationCadenceSelection;
      this.$refs.notificationByEmailCadenceDialog.$data.dialog = true;
    },
    async saveNotificationByEmailCadenceSelection() {
      const newCadence = this.$refs.notificationByEmailCadenceDialog.$data.finalSelection;
      await User.patch(
        this.user._id,
        {
          shouldChangeEmailNotification: true,
          organizationId: this.notificationCadenceOrgId,
          notificationByEmailCadence: newCadence,
        }
      )
      this.$refs.notificationByEmailCadenceDialog.$data.dialog = false;
    },
  }
}
</script>

<style scoped>

</style>
