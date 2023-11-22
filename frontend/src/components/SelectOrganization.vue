<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
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
            :active="currentOrganization ? organization._id === currentOrganization._id : false"
          >
            <template #title>{{ organization.name }}</template>
            <template #append>
              <v-btn
                icon="mdi-wrench"
                variant="text"
                flat
                @click="goToOrganizationEdit(organization)"
              />
              <v-btn
                icon="mdi-arrow-right"
                variant="text"
                flat
                @click="goToOrganization(organization)"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          :to="{ name: 'CreateOrganization'}"
          @click="dialog = false"
        >Create Organization</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

export default {
  name: "SelectOrganization",
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
    ...mapActions('app', ['setCurrentOrganization']),
    async goToOrganization(organization) {
      const { Organization } = models.api;
      await Organization.get(organization._id);
      await this.setCurrentOrganization(Organization.getFromStore(organization._id));
      this.$router.push({ name: 'OrganizationHome', params: { id: organization._id } });
      this.dialog = false;
    },
    async goToOrganizationEdit(organization) {
      const { Organization } = models.api;
      await Organization.get(organization._id);
      this.$router.push({ name: 'EditOrganization', params: { id: organization._id } });
      this.dialog = false;
    }
  }
}
</script>

<style scoped>
</style>
