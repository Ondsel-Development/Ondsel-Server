<template xmlns="http://www.w3.org/1999/html">
  <v-container v-if="workspace">
    <v-btn
      flat
      size="small"
      icon="mdi-arrow-left"
      @click="goHome()"
    />
    <span class="text-body-2">workspace &nbsp;</span>
    <span class="text-body-1 font-weight-bold">{{ workspace.name }}</span>
    <span v-if="!publicView">
      <v-btn
        icon="mdi-cog"
        size="small"
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
        icon="mdi-cog"
        size="small"
        flat
        color="grey"
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
          flat
          color="grey"
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
    <v-container class="d-flex flex-wrap">
      <one-promotion-sheet class="ma-2" max-width="30em" :curation="workspace.curation" :message="generalDescription"></one-promotion-sheet>
      <v-card class="ma-2 flex-md-grow-1" min-width="22em" max-height="15em">
        <v-card-text class="overflow-auto">
          <div v-if="longDescriptionHtml" v-html="longDescriptionHtml"></div>
          <div v-if="!longDescriptionHtml" class="text-disabled">no README.md</div>
        </v-card-text>
      </v-card>
    </v-container>
    <v-row class="mt-10">
      <v-text-field
        v-model="activePath"
        variant="outlined"
        label="Active Path"
        density="compact"
        readonly
      />
    </v-row>
    <v-row no-gutters>
      <v-col cols="3">
        <directory-list-view
          v-if="directory"
          :root-directory="directory"
          @selected-file="clickedFile"
          @selected-directory="clickedDirectory"
        />
      </v-col>
      <v-col cols="9">
        <WorkspaceFileView
          v-if="activeFile"
          :file="activeFile"
          :workspace="workspace"
          :full-path="activePath"
          :can-user-write="workspace.haveWriteAccess"
          :public-view="publicView"
          @open-directory="clickedDirectory"
        />
        <WorkspaceDirectoryView
          v-else
          :directory="activeDirectory || directory"
          :directoryPath="activePath === '/' ? '' : activePath"
          :can-user-write="workspace.haveWriteAccess"
          :public-view="publicView"
          @open-file="clickedFile"
          @open-directory="clickedDirectory"
        />
      </v-col>
    </v-row>
  </v-container>
  <edit-promotion-dialog v-if="currentOrganization" ref="editPromotionDialog" collection="workspaces" :item-id="workspace?._id" :item-name="workspace?.name"></edit-promotion-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';

import DirectoryListView from '@/components/DirectoryListView.vue';
import WorkspaceFileView from '@/components/WorkspaceFileView.vue';
import WorkspaceDirectoryView from '@/components/WorkspaceDirectoryView.vue';
import {marked} from "marked";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import OnePromotionSheet from "@/components/OnePromotionSheet.vue";

const { Directory, File, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: {
    OnePromotionSheet,
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
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

