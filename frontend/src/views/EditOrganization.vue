<template>
  <v-container v-if="organization">
    <!--      {{ organization }}-->
    <v-row>
      <div class="text-body-1">Organization&nbsp;</div>
      <div class="text-body-1 font-weight-bold">{{ organization.name }}</div>
    </v-row>
    <v-row class="mt-12">
      <organization-users-table :organization="organization" />
    </v-row>
    <v-row class="mt-12">
      <organization-groups-table :organization="organization" />
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import OrganizationUsersTable from '@/components/OrganizationUsersTable.vue';
import OrganizationGroupsTable from '@/components/OrganizationGroupsTable.vue';

const { Organization } = models.api;

export default {
  name: 'EditOrganization',
  components: { OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
  }),
  async created() {
    try {
      await Organization.get(this.$route.params.id);
    } catch (e) {
      if (e.data.type === 'PermissionError') {
        this.$router.push({ name: 'PageNotFound' });
      }
    }

  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    organization: vm => Organization.getFromStore(vm.$route.params.id),
  },
  watch: {
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
  }
}
</script>

<style scoped>
</style>
