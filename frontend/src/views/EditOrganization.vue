<template>
  <v-container v-if="organization">
    <v-row align="center">
      <div class="text-body-1">Organization&nbsp;</div>
      <v-btn
        flat
        variant="plain"
        class="text-body-1 font-weight-bold pa-0"
        style="text-decoration: none;"
        @click="$router.push({ name: 'OrganizationWorkspaces', params: { id: organization._id } })"
      >
        {{ organization.name }}
      </v-btn>
    </v-row>
    <v-row class="mt-12" v-if="userIsOwner">
      <v-btn
        variant="outlined"
        size="small"
        @click.stop="openDeleteOrgDialog()"
      >
        Delete Organization
      </v-btn>
      <v-spacer></v-spacer>
      <DeleteOrgDialog
        :is-active="isDeleteOrgDialogActive"
        :org="organization"
        ref="deleteOrgDialog"
      />
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
import DeleteOrgDialog from "@/components/DeleteOrgDialog.vue";

const { Organization } = models.api;

export default {
  name: 'EditOrganization',
  components: {DeleteOrgDialog, OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
    orgSrc: null,
    orgDetail: null,
    isDeleteOrgDialogActive: false,
    userIsOwner: false,
  }),
  async created() {
    try {
      await this.updateOrg();
    } catch (e) {
      if (e.data?.type === 'PermissionError') {
        this.$router.push({ name: 'PageNotFound' });
      } else if (e.toString().startsWith('NotFound')) {
        this.$router.push({ name: 'PageNotFound' });
      } else {
        console.log(e.data);
        console.log(e);
      }
    }

  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    organization: vm => vm.orgDetail,
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    async updateOrg() {
      this.orgSrc = await this.getOrgByIdOrNamePublic(this.$route.params.id);
      this.orgDetail = await Organization.get(this.orgSrc._id);
      this.userIsOwner = this.orgDetail.owner._id === this.loggedInUser.user._id;
    },
    async openDeleteOrgDialog() {
      this.isDeleteOrgDialogActive = true;
      this.$refs.deleteOrgDialog.$data.dialog = true;
    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'EditOrganization') {
        await this.updateOrg();
      }
    }
  },
}
</script>

<style scoped>
</style>
