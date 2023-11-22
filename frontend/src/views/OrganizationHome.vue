<template>
  <v-container>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

const { Organization } = models.api;

export default {
  name: 'OrganizationHome',
  data: () => ({
  }),
  async created() {
    await Organization.get(this.$route.params.id);
    const org = await Organization.getFromStore(this.$route.params.id);
    await this.setCurrentOrganization(org);
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    organization: vm => Organization.getFromStore(vm.$route.params.id),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
  }
}
</script>

<style scoped>
</style>
