<template>
  <Main>
    <template #title>
      <v-icon>mdi-folder-outline</v-icon>
      Workspace <b>{{ workspace.name }}</b>
    </template>
    <template #content>
      <v-sheet name="outer-wrapper">
        <v-sheet
          class=""
          max-width="72em"
          name="top-to-bottom-section"
        >
          <file-list-view
            :directory="activeDirectory"
            :path="activePath"
            :active-directory="activeDirectory"
            :public-view="publicView"
            :can-user-write="canUserWrite"
            :full-path="fullPath"
            parent-directory-path="/"
            @selected-directory="clickedDirectory"
            @create-directory="createDirectory"
          ></file-list-view>
          <v-sheet class="d-flex flex-row flex-wrap" name="bottom-section">
            <v-sheet class="border-md pa-1" name="info-and-readme-section">
              <v-sheet class="d-flex flex-wrap justify-space-between pa-1" name="top-of-info-section">
                <span class="text-h6">Details</span>
                <v-sheet>
                  <span v-if="!publicView">
                    <v-btn
                      class="ms-1"
                      icon="mdi-cog"
                      size="small"
                      color="decoration"
                      flat
                      @click.stop="goToWorkspaceEdit(workspace)"
                      id="editWorkspaceButton"
                    ></v-btn>
                    <v-tooltip
                      activator="#editWorkspaceButton"
                    >edit this workspace's settings</v-tooltip>
                  </span>
                  <span v-else>
                    <v-btn
                      class="ms-1"
                      icon="mdi-cog"
                      size="small"
                      color="decoration"
                      flat
                      id="disabledEditWorkspaceButton"
                    ></v-btn>
                    <v-tooltip
                      v-if="!currentOrganization"
                      activator="#disabledEditWorkspaceButton"
                    >you cannot edit anything when not logged in</v-tooltip>
                    <v-tooltip
                      v-if="currentOrganization && currentOrganization._id !== workspace?.organization?._id"
                      activator="#disabledEditWorkspaceButton"
                    >you are currently representing {{selfName}} and not {{ownerDescription}}</v-tooltip>
                  </span>
                  <span v-if="workspace.open === true">
                    <span v-if="promotionPossible">
                      <v-btn
                        icon="mdi-bullhorn"
                        size="small"
                        color="decoration"
                        flat
                        @click.stop="openEditPromotionDialog()"
                        id="promotionButton"
                      ></v-btn>
                      <v-tooltip
                        activator="#promotionButton"
                      >should {{selfPronoun}} promote this workspace</v-tooltip>
                    </span>
                    <span v-else>
                      <v-btn
                        size="small"
                        icon="mdi-bullhorn"
                        color="decoration"
                        flat
                        id="disabledPromotionButton"
                      >
                      </v-btn>
                      <v-tooltip
                        v-if="!currentOrganization"
                        activator="#disabledPromotionButton"
                      >must be logged in to promote anything</v-tooltip>
                      <v-tooltip
                        v-if="defaultWorkspaceFlag"
                        activator="#disabledPromotionButton"
                      >cannot promote a default workspace</v-tooltip>
                    </span>
                  </span>
                </v-sheet>
              </v-sheet>
              <curated-item-sheet max-width="24em" :curation="workspace.curation" :message="generalDescription"></curated-item-sheet>
            </v-sheet>
            <v-sheet max-width="50em" class="pa-1 border-md">
                <span class="text-h6 ma-2">README</span>
                <v-sheet>
                  <v-sheet max-height="40em" min-width="18em" style="overflow-y:auto;">
                      <markdown-viewer v-if="longDescriptionHtml" :markdown-html="longDescriptionHtml" class="ma-2 border-sm"></markdown-viewer>
                      <div v-if="!longDescriptionHtml" class="text-disabled ma-2">no README.md</div>
                  </v-sheet>
                </v-sheet>
            </v-sheet>
          </v-sheet>
        </v-sheet>
      </v-sheet>
      <edit-promotion-dialog v-if="currentOrganization" ref="editPromotionDialog" collection="workspaces" :item-id="workspace?._id" :item-name="workspace?.name"></edit-promotion-dialog>
    </template>
  </Main>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';
import _ from 'lodash';

import Main from '@/layouts/default/Main.vue';
import {marked} from "marked";
import FileListView from "@/components/FileListView.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import axios from "axios";

const { Directory, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: {
    EditPromotionDialog,
    CuratedItemSheet,
    MarkdownViewer,
    Main,
    FileListView,
  },
  data() {
    return {
      activeDirectory: {name: "/"},
      activePath: '/',
      workspaceDetail: null,
      directoryDetail: {},
      organizationDetail: undefined,
      slug: '',
      generalDescription: '',
      ownerDescription: 'unknown',
      publicViewDetail: false,
      defaultWorkspaceFlag: false,
      fullPath: [],
      fullLongDescription: null,
    };
  },
  async created() {
    await this.renew();
  },
  computed: {
    ...mapGetters('app', ['currentOrganization', 'selfPronoun', 'selfName']),
    ...mapState('auth', ['accessToken']),
    directory: vm => vm.directoryDetail,
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail || {name: 'tbd'},
    organization: vm => vm.organizationDetail,
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    dirId: vm => vm.$route.params.dirid || null,
    publicView: vm => vm.publicViewDetail,
    longDescriptionHtml: vm => marked(vm.fullLongDescription || vm.workspace?.curation?.longDescriptionMd || ""),
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
      'retrieveFileByUniqueName',
    ]),
    async renew() {
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
      try {
        this.workspaceDetail = await this.getWorkspaceByNamePrivate({wsName: wsName, orgName: orgRefName} );
      } catch (e) {};
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
      let targetDirectoryId = this.workspaceDetail.rootDirectory._id;
      if (this.dirId) {
        targetDirectoryId = this.dirId;
      }
      this.directoryDetail = this.publicViewDetail
        ? await this.getDirectoryByIdPublic(targetDirectoryId)
        : await Directory.get(targetDirectoryId);
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
      this.activeDirectory = this.directoryDetail;
      this.activePath = this.directory.name;
      await this.recursivelyBuildPath();
      this.fullLongDescription = await this.getFullLongDescription();
    },
    async clickedDirectory(directorySubDocs, dirPath) {
      let directory = this.publicView
        ? await this.getDirectoryByIdPublic(directorySubDocs._id)
        : await Directory.get(directorySubDocs._id);
      if (!directory) {
        await Directory.get(directorySubDocs._id);
        directory = Directory.getFromStore(directorySubDocs._id);
      }
      console.log(directory);
      this.activeDirectory = directory;
      this.activePath = dirPath;
    },
    async getFullLongDescription() {
      let content = null;
      for (const fileSum of this.directoryDetail.files) {
        if (fileSum.custFileName === 'README.md') {
          const file = await this.getFileByIdPublic(fileSum._id);
          let uName = file.currentVersion.uniqueFileName;
          let contentResult = await this.retrieveFileByUniqueName({uniqueFileName: uName, accessToken: this.accessToken});
          if (contentResult) {
            content = contentResult;
          }
        }
      }
      return content;
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
    async recursivelyBuildPath() {
      let currentDir = this.directoryDetail;
      let newFullPath = []
      newFullPath.unshift(_.pick(currentDir, ["_id", "name"]));
      let safetyCtr = 0;
      while (currentDir.parentDirectory) {
        currentDir = await  this.getDirectoryByIdPublic(currentDir.parentDirectory._id);
        newFullPath.unshift(_.pick(currentDir, ["_id", "name"]));
        safetyCtr += 1;
        if (safetyCtr > 30) {
          console.log("ERROR: path recursion 30 entries long. Loop?");
          break;
        }
      }
      this.fullPath = newFullPath;
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
  watch: {
    async '$route'(to, from) {
      await this.renew();
    }
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

