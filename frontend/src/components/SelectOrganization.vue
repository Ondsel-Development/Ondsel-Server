<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-model="dialog"
    width="auto"
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Your Organizations</div>
      </template>
      <v-progress-linear
        :active="false"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(organization, i) in user.organizations"
            :key="i"
            variant="text"
            flat
            :value="organization"
            :active="currentOrganization ? organization._id === currentOrganization._id : false"
            @click.stop="goToOrg(organization)"
          >
            <template #title>
              {{ organization.name }}
              <v-icon v-if="organization.type==='Open'" class="text-body-2" icon="mdi-earth" flag />
            </template>
            <template #append>
              <v-btn
                icon="mdi-cog"
                variant="text"
                flat
                @click.stop="goToOrgEdit(organization)"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          :hidden="!user.constraint.canCreatePrivateOrganization && !user.constraint.canCreateOpenOrganization"
          :to="{ name: 'CreateOrganization'}"
          @click="dialog = false"
        >Create Organization</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { getInitials } from '@/genericHelpers';
import OrganizationMixin from '@/mixins/organizationMixin';

export default {
  name: "SelectOrganization",
  mixins: [ OrganizationMixin ],
  props: {
    currentOrganization: Object,
  },
  data: () => {
    return {
      dialog: false,
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  methods: {
    getInitials,
    async goToOrg(organization) {
      await this.goToOrganization(organization);
      this.dialog = false;
    },
    async goToOrgEdit(organization) {
      await this.goToOrganizationEdit(organization)
      this.dialog = false;
    }
  }
}
</script>

<style scoped>
</style>
