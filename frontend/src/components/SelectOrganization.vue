<template>
  <v-sheet>
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-list class="my-2">
          <v-divider />
          <v-list-item v-bind="props" height="80px" min-width="60px" class="mb-0" style="background: white;" :disabled="!user">
            <template #prepend>
              <v-sheet class="d-flex flex-column justify-center align-center text-uppercase ml-n2" min-width="40" min-height="40" rounded="circle" color="grey-darken-2">
                {{ getInitials(currentOrganization?.name || '') }}
              </v-sheet>
            </template>
            <v-sheet class="d-flex align-start flex-column ml-2" style="background: inherit;" width="160">
              <span class="text-caption">Organization</span>
              <v-sheet class="d-flex align-start text-body-1 overflow-hidden" width="160" height="20px">{{ (currentOrganization && currentOrganization.name) || 'Select Organization' }}</v-sheet>
            </v-sheet>
            <template v-slot:append>
              <v-icon icon="mdi-arrow-up-down" size="x-small" color="black" />
            </template>
          </v-list-item>
          <v-divider />
        </v-list>
      </template>
      <v-list>
        <v-list-item
          v-for="(organization, i) in user.organizations"
          :key="i"
          variant="text"
          flat
          :value="organization"
          :active="currentOrganization ? organization._id === currentOrganization._id : false"
        >
          <template #title>
            <v-sheet @click="goToOrganization(organization)">
              {{ organization.name }}
              <v-icon v-if="organization.type==='Open'" class="text-body-2" icon="mdi-earth" flag />
            </v-sheet>
          </template>
          <template #append>
            <v-btn
              color="decorative"
              flat
              icon="mdi-cog"
              @click="goToOrganizationEdit(organization)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-sheet>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import {getInitials} from "../genericHelpers";

export default {
  name: "SelectOrganization",
  props: {
    currentOrganization: Object,
  },
  data: () => ({
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  methods: {
    getInitials,
    ...mapActions('app', ['setCurrentOrganization']),
    async goToOrganization(organization) {
      const { Organization } = models.api;
      await Organization.get(organization._id);
      await this.setCurrentOrganization(Organization.getFromStore(organization._id));
      if (organization.type === 'Personal') {
        this.$router.push({ name: 'UserWorkspaces', params: { id: this.user.username } });
      } else {
        this.$router.push({ name: 'OrganizationWorkspaces', params: { id: organization.refName } });
      }
    },
    async goToOrganizationEdit(organization) {
      const { Organization } = models.api;
      await Organization.get(organization._id);
      await this.setCurrentOrganization(Organization.getFromStore(organization._id));
      if (organization.type === 'Personal') {
        this.$router.push({name: 'AccountSettings', params: {slug: this.user.username}});
      } else {
        this.$router.push({ name: 'EditOrganization', params: { id: organization.refName } });
      }
    }
  }
}
</script>

<style scoped>
</style>
