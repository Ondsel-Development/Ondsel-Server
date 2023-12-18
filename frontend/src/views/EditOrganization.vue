<template>
  <v-container v-if="organization">
    <v-row align="center">
      <div class="text-body-1">Organization&nbsp;</div>
      <v-btn
        flat
        variant="plain"
        class="text-body-1 font-weight-bold pa-0"
        style="text-decoration: none;"
        @click="$router.push({ name: 'OrganizationHome', params: { id: organization._id } })"
      >
        {{ organization.name }}
      </v-btn>
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
import {mapActions, mapGetters, mapState} from 'vuex';
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
    if ((this.userCurrentOrganization === null) || (this.organization?.refName !== this.userCurrentOrganization.refName)) {
      console.log(`note: you are acting on behalf of '${this.userCurrentOrganization?.refName}' and tried to edit ${this.organization?.refName}; that is not appropriate.`);
      console.log(`redirecting to ${this.organization?.refName}'s public summary page.`);
      this.$router.push({ name: 'OrganizationHomePage', params: { orgName: this.organization?.refName } });
    };
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
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
    ...mapActions('app', ['getOrganizationByName']),
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
