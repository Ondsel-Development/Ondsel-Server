<template>
  <v-container v-if="workspace">
    <v-btn
      flat
      size="small"
      icon="mdi-arrow-left"
      @click="goHome()"
    />
    <span class="text-body-2">workspace &nbsp;</span>
    <span class="text-body-1 font-weight-bold">{{ workspace.name }}</span>
    <v-btn
      :disabled="publicView"
      icon="mdi-cog"
      size="small"
      flat
      @click.stop="goToWorkspaceEdit(workspace)"
    ></v-btn>
    <v-btn
      :disabled="!currentOrganization"
      icon="mdi-bullhorn"
      size="small"
      flat
      @click.stop="openEditPromotionDialog()"
    ></v-btn>
    <v-row class="mt-10">
      <v-col cols="6">
        <one-promotion-sheet :curation="workspace.curation" :message="generalDescription"></one-promotion-sheet>
      </v-col>
      <v-col cols="6">
        <v-card max-height="15em" min-height="8em">
          <v-card-text  class="overflow-auto">
            <div v-if="longDescriptionHtml" v-html="longDescriptionHtml"></div>
            <div v-if="!longDescriptionHtml" class="text-disabled">no README.md</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
import ReprViewer from "@/components/ReprViewer.vue";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import OnePromotionSheet from "@/components/OnePromotionSheet.vue";

const { Directory, File, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: {
    OnePromotionSheet,
    EditPromotionDialog, ReprViewer, DirectoryListView, WorkspaceFileView, WorkspaceDirectoryView },
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
      publicViewDetail: false,
    };
  },
  async created() {
    this.slug = this.$route.params.slug;
    const wsName = this.$route.params.wsname;
    let orgRefName = '';
    let ownerRealName = '';
    if (this.userRouteFlag) {
      const userDetail = await this.getUserByIdOrNamePublic(this.slug);
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
    if (!this.workspaceDetail) {
      this.publicViewDetail = true;
      this.workspaceDetail = await this.getWorkspaceByNamePublic({wsName: wsName, orgName: orgRefName} );
    }
    //
    if (!this.workspaceDetail) {
      console.log(`Not found: ${this.slug} ${wsName} combo not found in workspaces.`);
      this.$router.push({ name: 'PageNotFound' });
      return;
    }
    this.directoryDetail = this.publicViewDetail
      ? await this.getDirectoryByIdPublic(this.workspaceDetail.rootDirectory._id)
      : await Directory.get(this.workspace?.rootDirectory?._id);
    if (!this.organization) {
      this.organizationDetail = this.publicViewDetail
        ? await this.getOrgByIdOrNamePublic(this.workspace.organizationId)
        : await Organization.get(this.workspace.organizationId);
    }

    if (this.workspaceDetail.open) {
      this.generalDescription = "An open (shared with public) workspace"
      if (this.workspace.license) {
        this.generalDescription += " under license " + this.workspace.license;
      }
    } else {
      this.generalDescription = "A proprietary workspace"
    }
    if (this.userRouteFlag) {
      this.generalDescription += ` owned by user ${ownerRealName}`;
    } else {
      this.generalDescription += ` owned by organization ${this.organizationDetail.name}`;
    }

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
    ...mapGetters('app', ['currentOrganization']),
    directory: vm => vm.directoryDetail,
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
    organization: vm => vm.organizationDetail,
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    publicView: vm => vm.publicViewDetail,
    longDescriptionHtml: vm => marked(vm.workspace?.curation?.longDescriptionMd || ""),
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
      let file = await this.getFileByIdPublic(fileSubDocs._id);
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

