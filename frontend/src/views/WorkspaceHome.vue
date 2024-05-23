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
          <v-sheet class="d-flex flex-column flex-wrap flex-grow-1" name="left-hand-column-on-top">
            <file-list-view
              :directory="activeDirectory"
              :path="activePath"
              :active-directory="activeDirectory"
              :public-view="publicView"
              :full-path="fullPath"
              parent-directory-path="/"
              @selected-directory="clickedDirectory"
              @create-directory="createDirectory"
            ></file-list-view>
          </v-sheet>
          <v-sheet name="right-hand-column-on-top">
            <v-card min-width="32em" border>
              <v-card-title>
                <v-sheet class="d-flex flex-wrap justify-space-between">
                  <span>Details</span>
                  <v-btn
                    color="decoration"
                    flat
                    icon="mdi-cog"
                    @click="goToWorkspaceEdit(workspace)"
                  ></v-btn>
                </v-sheet>
              </v-card-title>
              <v-card-text>
                <curated-item-sheet class="ma-2" max-width="24em" :curation="workspace.curation" :message="generalDescription"></curated-item-sheet>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-sheet>
        <v-sheet name="bottom-section" border>
          <v-card min-width="32em">
            <v-card-title>markdown</v-card-title>
            <v-card-text>
              <v-card class="ma-2 flex-md-grow-1" min-width="22em" max-height="40em" style="overflow-y:auto;">
                <v-card-text>
                  <markdown-viewer v-if="longDescriptionHtml" :markdown-html="longDescriptionHtml"></markdown-viewer>
                  <div v-if="!longDescriptionHtml" class="text-disabled">no README.md</div>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-sheet>
      </v-sheet>
    </template>
  </Main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';
import _ from 'lodash';

import Main from '@/layouts/default/Main.vue';
import {marked} from "marked";
import FileListView from "@/components/FileListView.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";

const { Directory, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: {
    CuratedItemSheet,
    MarkdownViewer,
    Main,
    FileListView,
  },
  data() {
    return {
      activeDirectory: {name: "/"},
      activePath: '/',
      workspaceDetail: {},
      directoryDetail: {},
      organizationDetail: undefined,
      slug: '',
      generalDescription: '',
      ownerDescription: 'unknown',
      publicViewDetail: false,
      defaultWorkspaceFlag: false,
      fullPath: [],
    };
  },
  async created() {
    await this.renew();
  },
  computed: {
    ...mapGetters('app', ['currentOrganization', 'selfPronoun', 'selfName']),
    directory: vm => vm.directoryDetail,
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
    organization: vm => vm.organizationDetail,
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    dirId: vm => vm.$route.params.dirid || null,
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
        currentDir = await Directory.get(currentDir.parentDirectory._id);
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

