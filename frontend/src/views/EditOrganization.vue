<template>
  <v-container v-if="organization">
    <v-row align="center">
      <div class="text-body-1">Organization&nbsp;</div>
      <v-btn
        flat
        variant="plain"
        class="text-body-1 font-weight-bold pa-0"
        style="text-decoration: none;"
        @click="$router.push({ name: 'OrganizationWorkspaces', params: { id: organization.refName } })"
      >
        {{ organization.name }}
      </v-btn>
    </v-row>
    <v-card flat class="my-2">
      <v-card-text>
        <p class="text-body-1">Nature: {{organization.type}}</p>
        <p class="text-body-1">workspaces: <a :href="`${workspacesUrl}`">{{workspacesUrl}}</a></p>
        <p class="text-body-1">public homepage: <a :href="`${homepageUrl}`">{{homepageUrl}}</a></p>
      </v-card-text>
    </v-card>
    <v-row v-if="isLoggedInUserAdminOfOrganization" class="mt-12">
      <v-btn
        variant="outlined"
        size="small"
        :hidden="!isLoggedInUserAdminOfOrganization"
        @click.stop="openOrgChangeNameDialog()"
      >
        Change Name
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
    </v-row>
    <v-row class="mt-12">
      <organization-users-table :organization="organization" />
    </v-row>
    <v-row class="mt-12">
      <organization-groups-table :organization="organization" />
    </v-row>
    <OrgChangeNameDialog
      :is-active="isOrgChangeNameDialogActive"
      :org="organization"
      ref="orgChangeNameDialog"
    />
    <DeleteOrgDialog
      :is-active="isDeleteOrgDialogActive"
      :org="organization"
      ref="deleteOrgDialog"
    />
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import OrganizationUsersTable from '@/components/OrganizationUsersTable.vue';
import OrganizationGroupsTable from '@/components/OrganizationGroupsTable.vue';
import OrgChangeNameDialog from "@/components/OrgChangeNameDialog.vue";
import DeleteOrgDialog from "@/components/DeleteOrgDialog.vue";

const { Organization } = models.api;

export default {
  name: 'EditOrganization',
  components: {OrgChangeNameDialog, DeleteOrgDialog, OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
    orgSrc: null,
    orgDetail: null,
    isOrgChangeNameDialogActive: false,
    isDeleteOrgDialogActive: false,
    userIsOwner: false,
    workspacesUrl: 'tbd',
    homepageUrl: 'tbd',
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
    this.workspacesUrl = `/org/${this.orgSrc.refName}/workspaces`;
    this.homepageUrl = `/org/${this.orgSrc.refName}`;
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    organization: vm => vm.orgDetail,
    isLoggedInUserAdminOfOrganization: vm => vm.organization.users.some(user => user._id === vm.loggedInUser.user._id && user.isAdmin),
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    async updateOrg() {
      this.orgSrc = await this.getOrgByIdOrNamePublic(this.$route.params.id);
      this.orgDetail = await Organization.get(this.orgSrc._id);
      if (this.orgDetail.type === 'Personal') {
        this.$router.push({ name: 'AccountSettings',  params: { slug: this.orgDetail.owner.username }})
      }
      this.userIsOwner = this.orgDetail.owner._id === this.loggedInUser.user._id;
    },
    async openOrgChangeNameDialog() {
      this.isOrgChangeNameDialogActive = true;
      this.$refs.orgChangeNameDialog.$data.dialog = true;
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
