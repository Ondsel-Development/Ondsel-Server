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
        <v-list-subheader class="mb-2">Public Details</v-list-subheader>

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
                variant="elevated"
                color="secondary"
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
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="elevated"
                color="secondary"
                size="small"
                @click.stop="openEditDescriptionDialog()"
              >
                Edit Description
              </v-btn>
              <v-spacer></v-spacer>
              <EditDescriptionDialog
                :is-active="isOrgChangeDescriptionDialogActive"
                :long-description-md="organization.description || ''"
                ref="editDescriptionDialog"
                @save-description="saveDescriptionDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Long Description</v-list-item-title>
          <v-list-item-media>
            <v-card>
              <v-card-text>
                <markdown-viewer :markdown-html="longDescriptionHtml"></markdown-viewer>
              </v-card-text>
            </v-card>
          </v-list-item-media>
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="elevated"
                color="secondary"
                size="small"
                @click.stop="openEditLongDescriptionMdDialog()"
              >
                Edit Long Description
              </v-btn>
              <v-spacer></v-spacer>
              <EditLongDescriptionMdDialog
                :is-active="isOrgChangeLongDescriptionMdDialogActive"
                :long-description-md="organization.curation?.longDescriptionMd || ''"
                ref="editLongDescriptionMdDialog"
                @save-long-description-md="saveLongDescriptionMdDialog"
              />
            </v-list-item-action>
          </template>
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
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="elevated"
                color="secondary"
                size="small"
                @click.stop="openEditTagsDialog()"
              >
                Edit Tags
              </v-btn>
              <v-spacer></v-spacer>
              <EditTagsDialog
                :is-active="isOrgChangeTagsDialogActive"
                :tagList="organization.curation?.tags || []"
                ref="editTagsDialog"
                @save-tags="saveTags"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Public Links</v-list-item-title>
          <v-list>
            <v-list-item>
              <p class="text-body-1">Public Org Summary: <a :href="`${homepageUrl}`">{{homepageUrl}}</a></p>
            </v-list-item>
          </v-list>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">Private</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Admin</v-list-item-title>
          <template #append>
            <v-list-item-action>
              <v-btn
                v-if="userIsOwner"
                color="error"
                variant="elevated"
                size="small"
                @click.stop="openDeleteOrgDialog()"
              >
                Delete Organization
              </v-btn>
              <div v-else>
                <i>not admin</i>
              </div>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Links</v-list-item-title>
          <v-list>
            <v-list-item>
              <p class="text-body-1">Workspaces: <a :href="`${workspacesUrl}`">{{workspacesUrl}}</a></p>
            </v-list-item>
          </v-list>
        </v-list-item>
      </v-list>
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
import EditTagsDialog from "@/components/EditTagsDialog.vue";
import _ from "lodash";
import EditLongDescriptionMdDialog from "@/components/EditLongDescriptionMdDialog.vue";
import {marked} from "marked";
import EditDescriptionDialog from "@/components/EditDescriptionDialog.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";

const { Organization } = models.api;

export default {
  name: 'EditOrganization',
  components: {
    MarkdownViewer,
    EditDescriptionDialog,
    EditLongDescriptionMdDialog,
    EditTagsDialog,
    OrganizationPromotionsTable,
    OrgChangeNameDialog, DeleteOrgDialog, OrganizationUsersTable, OrganizationGroupsTable },
  data: () => ({
    orgSrc: null,
    orgDetail: null,
    isOrgChangeNameDialogActive: false,
    isDeleteOrgDialogActive: false,
    isOrgChangeTagsDialogActive: false,
    isOrgChangeDescriptionDialogActive: false,
    isOrgChangeLongDescriptionMdDialogActive: false,
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
    longDescriptionHtml: vm => marked(vm.organization?.curation?.longDescriptionMd || "*None*"),
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
    async openEditTagsDialog() {
      this.isOrgChangeTagsDialogActive = true;
      this.$refs.editTagsDialog.$data.newTags = this.organization.curation?.tags || [];
      this.$refs.editTagsDialog.$data.dialog = true;
    },
    async saveTags() {
      this.$refs.editTagsDialog.$data.isPatchPending = true;
      const tagList = this.$refs.editTagsDialog.$data.newTags;
      const lowercaseTags = tagList.map(tag => tag.toLowerCase().trim());
      const cleanTags = _.uniq(lowercaseTags);
      let curation = this.organization.curation || {};
      curation.tags = cleanTags;
      await Organization.patch(
        this.organization._id,
        {
          curation: curation,
        }
      ).then(() => {
        this.$refs.editTagsDialog.$data.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editTagsDialog.snackerMsg = e.message;
        this.$refs.editTagsDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editTagsDialog.$data.isPatchPending = false;
    },
    async openEditDescriptionDialog() {
      this.isOrgChangeDescriptionDialogActive = true;
      this.$refs.editDescriptionDialog.$data.dialog = true;
    },
    async saveDescriptionDialog() {
      this.$refs.editDescriptionDialog.$data.isPatchPending = true;
      const description = this.$refs.editDescriptionDialog.$data.newDescription;
      await Organization.patch(
        this.organization._id,
        {
          description: description,
        }
      ).then(() => {
        this.$refs.editDescriptionDialog.$data.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editDescriptionDialog.snackerMsg = e.message;
        this.$refs.editDescriptionDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editDescriptionDialog.$data.isPatchPending = false;
    },
    async openEditLongDescriptionMdDialog() {
      this.isOrgChangeLongDescriptionMdDialogActive = true;
      this.$refs.editLongDescriptionMdDialog.$data.dialog = true;
    },
    async saveLongDescriptionMdDialog() {
      this.$refs.editLongDescriptionMdDialog.$data.isPatchPending = true;
      const longDescriptionMd = this.$refs.editLongDescriptionMdDialog.$data.newLongDescriptionMd;
      let curation = this.organization.curation || {};
      curation.longDescriptionMd = longDescriptionMd;
      await Organization.patch(
        this.organization._id,
        {
          curation: curation,
        }
      ).then(() => {
        this.$refs.editLongDescriptionMdDialog.$data.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editLongDescriptionMdDialog.snackerMsg = e.message;
        this.$refs.editLongDescriptionMdDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editLongDescriptionMdDialog.$data.isPatchPending = false;
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
