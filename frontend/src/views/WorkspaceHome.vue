<template>
  <Main>
    <template #title>
      <div class="d-flex flex-row justify-center" style="align-items: center;">
        <span class="mr-2">Workspace</span> <b>{{ workspace.name }}</b>
      </div>
    </template>
    <template #content>
      <v-sheet class="d-flex flex-column flex-wrap" name="top-and-bottom-section">
        <v-sheet class="d-flex flex-row justify-space-between flex-wrap" name="top-section">
          <v-sheet class="d-flex flex-column flex-wrap" name="left-hand-column-on-top">
            <v-card min-width="32em">
              <v-card-title>
                Directories
              </v-card-title>
              <v-card-text>

                <v-list-item
                  variant="flat"
                  class="show-indent"
                >
                  <template v-slot:append>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          color="decoration"
                          flat
                          icon="mdi-dots-vertical"
                          v-bind="props"
                          size="x-small"
                        ></v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="$refs.createDirectoryDialog.$data.dialog = true;">
                          <v-list-item-title><v-icon icon="mdi-plus" class="mx-2"></v-icon> Add New Subdirectory</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                  <v-list-item-media>
                    <v-card>
                      <v-card-text>
                        <span class="text-body-2">/</span>
                      </v-card-text>
                    </v-card>
                  </v-list-item-media>
                </v-list-item>
                <directory-list-view
                  v-if="directory"
                  :directory="directory"
                  @selected-directory="clickedDirectory"
                  @create-directory="createDirectory"
                />
              </v-card-text>
            </v-card>
            <v-card min-width="32em">
              <v-card-title>Files in <code>/</code></v-card-title>
              <v-card-text>stuff</v-card-text>
            </v-card>
          </v-sheet>
          <v-sheet name="right-hand-column-on-top">
            <v-card min-width="32em">
              <v-card-title>Details</v-card-title>
              <v-card-text>stuff</v-card-text>
            </v-card>
          </v-sheet>
        </v-sheet>
        <v-sheet name="bottom-section">
          <v-card min-width="32em">
            <v-card-title>markdown</v-card-title>
            <v-card-text>stuff</v-card-text>
          </v-card>
        </v-sheet>
      </v-sheet>
      <create-directory-dialog ref="createDirectoryDialog" @create-directory="createDirectory" :parent-dir="directory"></create-directory-dialog>
    </template>
  </Main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';
import _ from 'lodash';

import DirectoryListView from '@/components/DirectoryListView.vue';
import WorkspaceFileView from '@/components/WorkspaceFileView.vue';
import WorkspaceDirectoryView from '@/components/WorkspaceDirectoryView.vue';
import {marked} from "marked";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";
import Main from '@/layouts/default/Main.vue';
import CreateDirectoryDialog from "@/components/CreateDirectoryDialog.vue";

const { Directory, File, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: {
    CreateDirectoryDialog,
    Main,
    CuratedItemSheet,
    MarkdownViewer,
    EditPromotionDialog, DirectoryListView, WorkspaceFileView, WorkspaceDirectoryView },
  data() {
    return {
      activeFile: null,
      activeDirectory: null,
      activePath: '',
      workspaceDetail: {},
      directoryDetail: {},
      organizationDetail: undefined,
      slug: '',
      generalDescription: '',
      ownerDescription: 'unknown',
      publicViewDetail: false,
      defaultWorkspaceFlag: false,
      parentDirectory: '/',
    };
  },
  async created() {
    this.slug = this.$route.params.slug;
    const wsName = this.$route.params.wsname;
    let orgRefName = '';
    let ownerRealName = '';
    let userDetail = null;
    if (this.userRouteFlag) {
      userDetail = await this.getUserByIdOrNamePublic(this.slug);
      if (!userDetail) {
        console.log(`No such user for ${this.slug}`);
        this.$router.push({ name: 'PageNotFound' });
        return;
      }
      orgRefName = userDetail._id.toString();
      ownerRealName = userDetail.name;
    } else {
      orgRefName = this.slug;
    }
    this.workspaceDetail = await this.getWorkspaceByNamePrivate({wsName: wsName, orgName: orgRefName} );
    if (this.workspaceDetail) {
      if (this.workspaceDetail.organization._id !== this.currentOrganization._id) {
        // if the user has private access to the ws generically, but isn't actually representing that org, then
        // set the publicView flag anyway
        this.publicViewDetail = true;
      }
    } else {
      this.publicViewDetail = true;
      this.workspaceDetail = await this.getWorkspaceByNamePublic({wsName: wsName, orgName: orgRefName} );
    }
    //
    if (!this.workspaceDetail) {
      console.log(`Not found: ${this.slug} ${wsName} combo not found in workspaces.`);
      this.$router.push({ name: 'PageNotFound' });
      return;
    }
    if (this.userRouteFlag && userDetail) {
      if (userDetail.defaultWorkspaceId.toString() === this.workspaceDetail._id.toString()) {
        this.defaultWorkspaceFlag = true;
      }
    }
    this.directoryDetail = this.publicViewDetail
      ? await this.getDirectoryByIdPublic(this.workspaceDetail.rootDirectory._id)
      : await Directory.get(this.workspace?.rootDirectory?._id);
    if (!this.organization) {
      this.organizationDetail = this.publicViewDetail
        ? await this.getOrgByIdOrNamePublic(this.workspace.organizationId)
        : await Organization.get(this.workspace.organizationId);
    }

    if (this.userRouteFlag) {
      this.ownerDescription = `user ${ownerRealName}`;
    } else {
      this.ownerDescription = `organization ${this.organizationDetail.name}`;
    }
    if (this.workspaceDetail.open) {
      this.generalDescription = "An open (shared with public) workspace"
      if (this.workspace.license) {
        this.generalDescription += " under license " + this.workspace.license;
      }
    } else {
      this.generalDescription = "A proprietary workspace"
    }
    this.generalDescription += ` owned by ${this.ownerDescription}`

    if (!this.publicViewDetail) {
      if (this.organization._id !== this.currentOrganization._id) {
        switch (this.organization.type) {
          case 'Private':
          case 'Personal':
            if (this.workspaceDetail.open !== true) {
              if (this.userRouteFlag) {
                this.$router.push({ name: 'PermissionError', params: {slug: this.slug, urlCode: `/user/${this.slug}/workspace/${this.workspaceRefName}`}})
              } else {
                this.$router.push({ name: 'PermissionError', params: {slug: this.slug, urlCode: `/org/${this.slug}/workspace/${this.workspaceRefName}`}})
              }
            }
            break;
          case 'Open':
            break;
        }
      }
    }
    this.activePath = this.directory.name;
  },
  computed: {
    ...mapGetters('app', ['currentOrganization', 'selfPronoun', 'selfName']),
    directory: vm => vm.directoryDetail,
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
    organization: vm => vm.organizationDetail,
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    publicView: vm => vm.publicViewDetail,
    longDescriptionHtml: vm => marked(vm.workspace?.curation?.longDescriptionMd || ""),
    promotionPossible: vm => vm.currentOrganization && !vm.defaultWorkspaceFlag,
    canUserWrite: vm => vm.workspace.haveWriteAccess,
  },
  methods: {
    ...mapActions('app', [
      'getWorkspaceByNamePrivate',
      'getUserByIdOrNamePublic',
      'getWorkspaceByNamePublic',
      'getDirectoryByIdPublic',
      'getOrgByIdOrNamePublic',
      'getFileByIdPublic',
    ]),
    async clickedFile(fileSubDocs, filePath) {
      let file = this.publicView
        ? await this.getFileByIdPublic(fileSubDocs._id)
        : File.getFromStore(fileSubDocs._id);
      if (!file) {
        await File.get(fileSubDocs._id);
        file = File.getFromStore(fileSubDocs._id);
      }
      this.activeDirectory = null;
      this.activeFile = file;
      this.activePath = filePath;
    },
    async clickedDirectory(directorySubDocs, dirPath) {
      let directory = this.publicView
        ? await this.getDirectoryByIdPublic(directorySubDocs._id)
        : await Directory.get(directorySubDocs._id);
      if (!directory) {
        await Directory.get(directorySubDocs._id);
        directory = Directory.getFromStore(directorySubDocs._id);
      }
      this.activeFile = null;
      this.activeDirectory = directory;
      this.activePath = dirPath;
    },
    async goHome() {
      if (this.publicView) {
        if (this.userRouteFlag) {
          this.$router.push({ name: 'UserHome', params: { slug: this.slug } });
        } else {
          this.$router.push({ name: 'OrganizationHome', params: { slug: this.slug } });
        }
      } else {
        if (this.userRouteFlag) {
          this.$router.push({ name: 'UserWorkspaces', params: { id: this.slug } });
        } else {
          this.$router.push({ name: 'OrganizationWorkspaces', params: { id: this.slug } });
        }
      }
    },
    async goToWorkspaceEdit(workspace) {
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserEditWorkspace', params: { slug: this.slug, wsname: workspace.refName } });
      } else {
        this.$router.push({ name: 'OrgEditWorkspace', params: { slug: workspace.organization.refName, wsname: workspace.refName } });
      }
    },
    async openEditPromotionDialog() {
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
    async createDirectory(directoryName, parentDir) {
      const workspaceSummary = _.pick(this.workspace, ["_id", "name", "refName", "open"]);
      const parentDirSummary = _.pick(parentDir, ["_id", "name"])
      try {
        await Directory.create({
          name: directoryName,
          workspace: workspaceSummary,
          parentDirectory: parentDirSummary,
        });
      } catch (e) {
        const msg = e.message;
        this.$refs.createDirectoryDialog.$data.snackerMsg = msg;
        this.$refs.createDirectoryDialog.$data.showSnacker = true;
        return;
      }
      this.$refs.createDirectoryDialog.$data.dialog = false;
    },
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

