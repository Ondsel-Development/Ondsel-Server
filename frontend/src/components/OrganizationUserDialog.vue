<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Edit User Dialog</div>
      </template>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="outlined" class="mb-2">
          <template v-slot:title>
            Validation Error
          </template>
          <div v-if="error.groups && error.groups.length" class="text-body-2">
            Remove user from below groups in order to proceed operation:
            <ul class="ml-2">
              <li v-for="group of error.groups" :key="group._id">- {{ group.name }}</li>
            </ul>
          </div>
          <div v-if="error.workspaces && error.workspaces.length" class="text-body-2">
            Remove user from below workspaces in order to proceed operation:
            <ul class="ml-2">
              <li v-for="workspace of error.workspaces" :key="workspace._id">- {{ workspace.name }}</li>
            </ul>
          </div>
        </v-alert>
        <div class="text-body-2" style="text-align: center">
          user <span class="font-weight-bold">{{ user.name }}</span> in organization <span class="font-weight-bold">{{ organization.name }}</span>
        </div>

        <div class="text-body-1 mt-4" style="text-align: center">
          Name: {{ user.name }}
        </div>
        <div class="text-body-1" style="text-align: center">
          Username: {{ user.username }}
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          :disabled="isPatchPending"
          @click="dialog = false"
        >Close</v-btn>
        <template v-if="!isUserOwner && isLoggedInUserAdmin(organization)">
          <v-btn
            v-if="!user.isAdmin"
            color="error"
            variant="elevated"
            :disabled="isPatchPending"
            :loading="isPatchPending"
            @click="makeOrganizationAdmin"
          >Make Admin</v-btn>
          <v-btn
            v-else
            color="error"
            variant="elevated"
            :disabled="isPatchPending"
            :loading="isPatchPending"
            @click="revokeOrganizationAdmin"
          >Revoke Admin Access</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="isPatchPending"
            :loading="isPatchPending"
            @click="confirmationDialog = true;"
          >Remove from Organization</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="confirmationDialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Confirmation Dialog</div>
      </template>
      <v-card-text>
        <div class="text-body-2" style="text-align: center">
          Are you sure, you want to remove <span class="font-weight-bold">{{ user.name }}</span> from organization <span class="font-weight-bold">{{ organization.name }}</span>.
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="confirmationDialog = false"
        >No</v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="removeUserFromOrganization"
        >Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters, mapState} from 'vuex';

export default {
  name: "OrganizationUserDialog",
  props: {
    user: Object,
    organization: Object,
  },
  data: () => ({
    dialog: false,
    confirmationDialog: false,
    error: undefined,
  }),
  computed: {
    ...mapState('organizations', ['isPatchPending']),
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
    isUserOwner: vm => vm.organization.owner._id === vm.user._id,
  },
  methods: {
    async removeUserFromOrganization() {
      this.confirmationDialog = false;
      try {
        await this.organization.patch({
          data: {
            shouldRemoveUsersFromOrganization: true,
            userIds: [this.user._id.toString()],
          }
        });
        this.dialog = false;
      } catch (e) {
        if (e.data.type === 'ValidationError') {
          this.error = e.data;
        }
      }
    },
    openDialog() {
      this.error = undefined;
      this.dialog = true;
    },
    async makeOrganizationAdmin() {
      try {
        await this.organization.patch({
          data: {
            shouldGiveAdminAccessToUsersOfOrganization: true,
            userIds: [this.user._id.toString()],
          }
        });
        this.dialog = false;
      } catch (e) {
        if (e.data.type === 'ValidationError') {
          this.error = e.data;
        }
      }
    },
    async revokeOrganizationAdmin() {
      try {
        await this.organization.patch({
          data: {
            shouldRevokeAdminAccessFromUsersOfOrganization: true,
            userIds: [this.user._id.toString()],
          }
        });
        this.dialog = false;
      } catch (e) {
        if (e.data.type === 'ValidationError') {
          this.error = e.data;
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
