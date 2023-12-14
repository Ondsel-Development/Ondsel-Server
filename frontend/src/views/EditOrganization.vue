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
import {mapActions, mapGetters, mapState} from 'vuex';
import OrganizationUsersTable from '@/components/OrganizationUsersTable.vue';
import OrganizationGroupsTable from '@/components/OrganizationGroupsTable.vue';
import {models} from "@feathersjs/vuex";

export default {
  name: 'EditOrganization',
  components: { OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
    organizationDetail: undefined,
  }),
  async mounted() {
    this.organizationDetail = await this.getOrganizationByName(this.$route.params.orgName);
    if (!this.organization) {
      this.$router.push({ name: 'PageNotFound' });
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    organization: vm => vm.organizationDetail,
  },
  watch: {
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
    getOrganizationByName: async (name) => {
      let result = undefined;
      const orgResult = await models.api.Organization.find({
        query: {
          refName: name,
        }
      });
      if (orgResult.total !== 0) {
        let orgId = orgResult.data[0]._id;
        result = await models.api.Organization.get(orgId);
      }
      return result;
    },
  }
}
</script>

<style scoped>
</style>
