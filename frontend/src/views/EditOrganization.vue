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
import {mapActions, mapState} from 'vuex';
import OrganizationUsersTable from '@/components/OrganizationUsersTable.vue';
import OrganizationGroupsTable from '@/components/OrganizationGroupsTable.vue';

export default {
  name: 'EditOrganization',
  components: { OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
    organizationDetail: undefined,
  }),
  async mounted() {
    await this.refreshOrg();
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    organization: vm => vm.organizationDetail,
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'EditOrganization') {
        await this.refreshOrg();
      }
    }
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization', 'getOrganizationByName']),
    async refreshOrg() {
      if (this.$route.params.orgName.length > 20) {
        this.$router.push({ name: 'PageNotFound' }) // personal orgs don't have settings, how did the user get here?
      }
      this.organizationDetail = await this.getOrganizationByName(this.$route.params.orgName);
      if (!this.organization) {
        this.$router.push({ name: 'PageNotFound' });
      }
    },
  }
}
</script>

<style scoped>
</style>
