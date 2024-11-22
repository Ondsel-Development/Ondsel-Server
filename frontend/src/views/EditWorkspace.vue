<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <Main>
    <template #title>
      <div class="d-flex flex-row" style="align-items: center;">
        <div class="text-body-1">Workspace&nbsp;</div>
        <v-btn
          v-if="workspace"
          flat
          variant="plain"
          color="link"
          class="text-body-1 font-weight-bold pa-0"
          style="text-decoration: none;"
          @click="goHome()"
        >
          {{ workspace.name }}
        </v-btn>
      </div>
    </template>
    <template #content>
      <v-container v-if="workspace">
        <v-tabs
          v-model="tab"
          align-tabs="center"
        >
          <v-tab value="1">General Details</v-tab>
          <v-tab v-if="!userRouteFlag" value="2">Users</v-tab>
          <v-tab v-if="!userRouteFlag" value="3">Groups</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="1">
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
                    {{ workspace.name }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-list-item-action>
                      <v-btn
                        v-if="!forbidNameChange"
                        variant="elevated"
                        color="secondary"
                        size="small"
                        @click.stop="openWorkspaceChangeNameDialog()"
                      >
                        Change Name
                      </v-btn>
                      <div v-if="forbidNameChange"><i>{{forbidNameChangeReason}}</i></div>
                      <v-spacer></v-spacer>
                      <WorkspaceChangeNameDialog
                        :is-active="isWorkspaceChangeNameDialogActive"
                        :workspace="workspace"
                        ref="workspaceChangeNameDialog"
                      />
                    </v-list-item-action>
                  </template>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Open to Public View</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ workspace.open }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-list-item-action>
                      <v-btn
                        variant="elevated"
                        color="secondary"
                        size="small"
                        @click.stop="openWorkspaceOpenSelectDialog()"
                        v-if="changableVisibility === true"
                      >
                        Change Visibility
                      </v-btn>
                      <div v-if="changableVisibility === false">
                        <i> {{ changableVisibilityReason }} </i>
                      </div>
                      <v-spacer></v-spacer>
                      <WorkspaceOpenSelectDialog
                        :is-active="isWorkspaceOpenSelectDialogActive"
                        :workspace="workspace"
                        ref="workspaceOpenSelectDialog"
                      />
                    </v-list-item-action>
                  </template>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Share License (if any)</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ workspace.license || 'none assigned' }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-list-item-action>
                      <v-btn
                        variant="elevated"
                        color="secondary"
                        size="small"
                        @click.stop="openWorkspaceChangeLicenseDialog()"
                      >
                        Change License
                      </v-btn>
                      <v-spacer></v-spacer>
                      <WorkspaceChangeLicenseDialog
                        :is-active="isWorkspaceChangeLicenseDialogActive"
                        :workspace="workspace"
                        ref="workspaceChangeLicenseDialog"
                      />
                    </v-list-item-action>
                  </template>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Short Description</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ workspaceDetail.description }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-list-item-action>
                      <v-btn
                        variant="elevated"
                        color="secondary"
                        size="small"
                        @click.stop="openWorkspaceChangeDescDialog()"
                      >
                        Change Description
                      </v-btn>
                      <v-spacer></v-spacer>
                      <WorkspaceChangeDescDialog
                        :is-active="isWorkspaceChangeDescDialogActive"
                        :workspace="workspace"
                        ref="workspaceChangeDescDialog"
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
                        <div v-html="longDescriptionHtml"></div>
                      </v-card-text>
                    </v-card>
                  </v-list-item-media>
                  <v-list-item-action>
                    <i>The long description is pulled from the <code>README.md</code> file (if there is one) in the root
                      directory of the workspace. The first 40 lines (or 2000 characters) are used for searching and display.</i>
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Tags</v-list-item-title>
                  <v-list-item-subtitle>
                    <div v-if="workspace.curation?.tags && workspace.curation?.tags?.length > 0">
                      <v-chip-group>
                        <v-chip v-for="(tag) in workspace.curation?.tags">{{tag}}</v-chip>
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
                        :is-active="isEditTagsDialogActive"
                        :tagList="workspace.curation?.tags || []"
                        ref="editTagsDialog"
                        @save-tags="saveTags"
                      />
                    </v-list-item-action>
                  </template>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>File Used To Represent The Workspace</v-list-item-title>
                  <v-list-item-subtitle>
                    {{workspace.curation?.representativeFile?.custFileName}}
                  </v-list-item-subtitle>
                  <v-list-item-media>
                    <v-card>
                      <v-card-text>
                        <repr-viewer :curation="workspace.curation"></repr-viewer>
                        <span v-if="!workspace.curation?.representativeFile"><i>None</i></span>
                      </v-card-text>
                    </v-card>
                  </v-list-item-media>
                  <v-list-item-action>
                    <i>To change this, visit the workspace, select the file, and click on the "camera" icon button.</i>
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Deletion</v-list-item-title>
                  <v-list-item-subtitle>
                    <span v-if="workspace.isUserDefaultWorkspace"><i>A user's default workspace cannot be deleted.</i></span>
                    <span v-else><i>The workspace must be free of all files and directories first.</i></span>
                  </v-list-item-subtitle>
                  <template #append>
                    <v-list-item-action>
                      <v-btn
                        variant="elevated"
                        color="error"
                        size="small"
                        @click.stop="openDeleteWorkspaceDialog()"
                        :disabled="workspace.isUserDefaultWorkspace"
                      >
                        delete workspace
                      </v-btn>
                      <v-spacer></v-spacer>
                      <delete-generic-dialog
                        ref="deleteWorkspaceDialog"
                        :title="'Workspace '+ workspace.name"
                        warning-message="Deleting this workspace is not reversible. If part of any groups, those groups will no longer know of the workspace."
                        :error-message="deleteWorkspaceErrorMsg"
                        @delete="deleteWorkspace"
                      ></delete-generic-dialog>
                    </v-list-item-action>
                  </template>
                </v-list-item>

              </v-list>
            </v-card>

          </v-tabs-window-item>
          <v-tabs-window-item v-if="!userRouteFlag" value="2">
            <manage-workspace-users-table :workspace="workspace" />
          </v-tabs-window-item>
          <v-tabs-window-item v-if="!userRouteFlag" value="3">
            <manage-workspace-groups-table :workspace="workspace" />
          </v-tabs-window-item>
        </v-tabs-window>
        <v-row class="mt-12" v-if="userRouteFlag">
          <i>user and group rights do not apply here</i>
        </v-row>
      </v-container>
    </template>
  </Main>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {mapActions, mapGetters, mapState} from 'vuex';
import ManageWorkspaceUsersTable from '@/components/ManageWorkspaceUsersTable.vue';
import ManageWorkspaceGroupsTable from '@/components/ManageWorkspaceGroupsTable.vue';
import WorkspaceChangeNameDialog from "@/components/WorkspaceChangeNameDialog.vue";
import WorkspaceChangeDescDialog from "@/components/WorkspaceChangeDescDialog.vue";
import WorkspaceOpenSelectDialog from "@/components/WorkspaceOpenSelectDialog.vue";
import WorkspaceChangeLicenseDialog from "@/components/WorkspaceChangeLicenseDialog.vue";
import ReprViewer from "@/components/ReprViewer.vue";
import EditTagsDialog from "@/components/EditTagsDialog.vue";
import Main from '@/layouts/default/Main.vue';
import _ from 'lodash';
import {marked} from "marked";
import DeleteGenericDialog from "@/components/DeleteGenericDialog.vue";

const { Workspace } = models.api;

const { Organization } = models.api;

export default {
  name: "EditWorkspace",
  components: {
    DeleteGenericDialog,
    Main,
    EditTagsDialog,
    ReprViewer,
    WorkspaceChangeLicenseDialog,
    WorkspaceOpenSelectDialog,
    WorkspaceChangeNameDialog, WorkspaceChangeDescDialog, ManageWorkspaceGroupsTable, ManageWorkspaceUsersTable },
  data: () => ({
    workspaceDetail: {groupsOrUsers:[]},
    slug: '',
    changableVisibility: false,
    changableVisibilityReason: 'tbd',
    isWorkspaceChangeNameDialogActive: false,
    isWorkspaceChangeDescDialogActive: false,
    forbidNameChange: true,
    forbidNameChangeReason: 'tbd',
    isWorkspaceOpenSelectDialogActive: false,
    isWorkspaceChangeLicenseDialogActive: false,
    isEditTagsDialogActive: false,
    tab: null,
    deleteWorkspaceErrorMsg: '',
    goHomeNext: false, // this is used to prevent 404 after deleting workspace
  }),
  async created() {
    if (this.goHomeNext) {
     await this.goHome();
    }
    this.slug = this.$route.params.slug;
    if (this.userRouteFlag) {
      const userDetail = await this.getUserByIdOrNamePublic(this.slug);
      if (!userDetail) {
        this.$router.push({ name: 'PageNotFound' });
        return;
      }
      this.workspaceDetail = await this.getWorkspaceByNamePrivate({wsName: this.$route.params.wsname, orgName: userDetail._id.toString()} );
    } else {
      this.workspaceDetail = await this.getWorkspaceByNamePrivate({wsName: this.$route.params.wsname, orgName: this.slug} );
    }
    if (!this.workspaceDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      if (this.workspace.organization?.type !== 'Open') {
        this.$router.push({ name: 'PermissionError', params: {slug: this.organization?.refName, urlCode: `/org/${this.organization?.refName}/workspace/${this.workspaceRefName}/edit`}})
      }
    }
    switch (this.workspace.organization.type) {
      case 'Personal':
        if (this.user.tier === 'Peer' || this.user.tier === 'Enterprise') {
          this.changableVisibility = true;
        } else {
          this.changableVisibility = false;
          this.changableVisibilityReason = `cannot change at ${this.user.tier} tier`
        }
        if (this.user.defaultWorkspaceId.toString() === this.workspace._id.toString()) {
          this.forbidNameChange = true;
          this.forbidNameChangeReason = 'default Personal workspace name not editable';
        } else {
          this.forbidNameChange = false;
        }
        break;
      case 'Open':
        this.forbidNameChange = false;
        this.changableVisibility = false;
        this.changableVisibilityReason = `this is an open org`
        break;
      case 'Private':
        this.forbidNameChange = false;
        this.changableVisibility = true;
        break;
      case 'Ondsel':
        this.forbidNameChange = false;
        this.changableVisibility = true;
        break;
    }
    if (!this.organization) {
      // require for manage user and group of workspace
      await Organization.get(this.workspace.organizationId);
    }
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    ...mapState('auth', ['user']),
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
    organization: vm => Organization.getFromStore(vm.workspace.organizationId),
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    longDescriptionHtml: vm => marked(vm.workspace?.curation?.longDescriptionMd || "*None*"),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization', 'getWorkspaceByNamePrivate', 'getUserByIdOrNamePublic']),
    async goHome() {
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaceHome', params: { slug: this.slug, wsname: this.workspace.refName } });
      } else {
        this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: this.slug, wsname: this.workspace.refName } });
      }
    },
    async openWorkspaceChangeNameDialog() {
      this.isWorkspaceChangeNameDialogActive = true;
      this.$refs.workspaceChangeNameDialog.$data.newWorkspaceName = this.workspace.name;
      this.$refs.workspaceChangeNameDialog.$data.allowNameChange = !this.forbidNameChange;
      this.$refs.workspaceChangeNameDialog.$data.dialog = true;
    },
    async openWorkspaceChangeDescDialog() {
      this.isWorkspaceChangeDescDialogActive = true;
      this.$refs.workspaceChangeDescDialog.$data.newWorkspaceDesc = this.workspace.description;
      this.$refs.workspaceChangeDescDialog.$data.dialog = true;
    },
    async openWorkspaceOpenSelectDialog() {
      this.isWorkspaceOpenSelectDialogActive = true;
      this.$refs.workspaceOpenSelectDialog.$data.newOpenSelect = this.workspace.open.toString();
      this.$refs.workspaceOpenSelectDialog.$data.dialog = true;
    },
    async openWorkspaceChangeLicenseDialog() {
      this.isWorkspaceChangeLicenseDialogActive = true;
      this.$refs.workspaceChangeLicenseDialog.$data.newLicense = this.workspace.license || "null";
      this.$refs.workspaceChangeLicenseDialog.$data.dialog = true;
    },
    async openEditTagsDialog() {
      this.isEditTagsDialogActive = true;
      this.$refs.editTagsDialog.$data.newTags = this.workspace.curation?.tags || [];
      this.$refs.editTagsDialog.$data.dialog = true;
    },
    async saveTags() {
      this.$refs.editTagsDialog.$data.isPatchPending = true;
      const tagList = this.$refs.editTagsDialog.$data.newTags;
      const lowercaseTags = tagList.map(tag => tag.toLowerCase().trim());
      const cleanTags = _.uniq(lowercaseTags);
      let curation = this.workspace.curation || {};
      curation.tags = cleanTags;
      await Workspace.patch(
        this.workspace._id,
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
    async openDeleteWorkspaceDialog() {
      this.deleteWorkspaceErrorMsg = '';
      this.$refs.deleteWorkspaceDialog.$data.showDialog = true;
    },
    async deleteWorkspace() {
      this.deleteWorkspaceErrorMsg = 'pending...';
      this.goHomeNext = true;
      await Workspace.remove(
        this.workspace._id
      ).then(() => {
        this.goHome();
      }).catch((e) => {
        this.goHomeNext = false;
        this.deleteWorkspaceErrorMsg = 'ERROR: ' + e.toString()
      }).finally(() => {
        if (this.goHomeNext) {
          this.goHome();
        }
      });
    }
  }
}
</script>

<style scoped>

</style>
