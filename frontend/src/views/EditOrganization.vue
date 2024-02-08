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

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">General Details</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Name</v-list-item-title>
          <v-list-item-subtitle>
            {{ organization.name }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action>
              <v-btn
                v-if="isLoggedInUserAdminOfOrganization"
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openOrgChangeNameDialog()"
              >
                Change Name
              </v-btn>
              <div v-else>
                <i>not admin</i>
              </div>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Nature</v-list-item-title>
          <v-list-item-subtitle>
            {{organization.type}}
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Short Description</v-list-item-title>
          <v-list-item-subtitle>
            <div v-if="organization.description">
              {{ organization.description }}
            </div>
            <div v-else>
              <i>none supplied</i>
            </div>
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Long Description</v-list-item-title>
          <v-list-item-media>
            <v-card>
              <v-card-text>
                <div v-html="longDescriptionHtml"></div>
              </v-card-text>
            </v-card>
          </v-list-item-media>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Tags</v-list-item-title>
          <v-list-item-subtitle>
            <div v-if="organization.curation?.tags && organization.curation?.tags?.length > 0">
              <v-chip-group>
                <v-chip v-for="(tag) in organization.curation?.tags">{{tag}}</v-chip>
              </v-chip-group>
            </div>
            <span v-else><i>None</i></span>
          </v-list-item-subtitle>
        </v-list-item>

      </v-list>
    </v-card>

    <v-card flat class="my-2">
      <v-card-text>
        <p class="text-body-1">workspaces: <a :href="`${workspacesUrl}`">{{workspacesUrl}}</a></p>
        <p class="text-body-1">public homepage: <a :href="`${homepageUrl}`">{{homepageUrl}}</a></p>
        <v-btn
          v-if="userIsOwner"
          variant="outlined"
          size="small"
          @click.stop="openDeleteOrgDialog()"
        >
          Delete Organization
        </v-btn>
      </v-card-text>
    </v-card>
    <v-row class="mt-12">
      <organization-users-table :organization="organization" />
    </v-row>
    <v-row class="mt-12">
      <organization-groups-table :organization="organization" />
    </v-row>
    <v-row class="mt-12">
      <organization-promotions-table :organization="organization" />
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
import OrganizationPromotionsTable from "@/components/OrganizationPromotionsTable.vue";

const { Organization } = models.api;

export default {
  name: 'EditOrganization',
  components: {
    OrganizationPromotionsTable,
    OrgChangeNameDialog, DeleteOrgDialog, OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
    orgSrc: null,
    orgDetail: null,
    isOrgChangeNameDialogActive: false,
    isDeleteOrgDialogActive: false,
    userIsOwner: false,
    workspacesUrl: 'tbd',
    homepageUrl: 'tbd',
    longDescriptionHtml: 'tbd',
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
