<template>
  <v-container fluid class="fill-height">
    <v-card title="Create a new Organization" class="mx-auto position-relative" width="400" style="top: -100px" flat>
      <template v-slot:loader="{ isActive }">
        <v-progress-linear
          :active="isCreatePending"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-form v-model="isValid" @submit.prevent="createOrganization">
        <v-text-field
          v-model="organization.name"
          label="Name"
          :rules="[rules.isRequired]"
          :disabled="false"
          autofocus
        ></v-text-field>
        <v-card-actions>
          <v-btn type="submit" :disabled="isCreatePending" block class="mt-2">Create</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

const { Organization } = models.api;

export default {
  name: 'CreateOrganization',
  data: () => ({
    organization: new Organization(),
    isValid: false,
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('organizations', ['isCreatePending'])
  },
  methods: {
    async createOrganization() {
      const org = await this.organization.create();
      this.$router.push({ name: 'OrganizationHome', params: { id: org._id } });
    }
  }
}
</script>

<style scoped>
</style>
