<template>
  <v-container v-if="workspace">
    <v-row class="align-center">
      <v-btn
        flat
        size="small"
        icon="mdi-arrow-left"
        @click="goHome()"
      />
      <div class="text-body-1">Workspace &nbsp</div>
      <div class="text-body-1 font-weight-bold">{{ workspace.name }}</div>
<!--      <v-spacer />-->
<!--      <div class="align-end">-->
<!--        <v-btn flat icon="mdi-pencil"></v-btn>-->
<!--      </div>-->
    </v-row>
    <v-row class="mt-10">
      <p>"{{workspace.description}}"</p>
    </v-row>
    <v-row class="mt-10">
      <p><i>{{openMessage}}</i></p>
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
          :full-path="activePath"
          :can-user-write="workspace.haveWriteAccess"
          @open-directory="clickedDirectory"
        />
        <WorkspaceDirectoryView
          v-else
          :directory="activeDirectory || directory"
          :directoryPath="activePath === '/' ? '' : activePath"
          :can-user-write="workspace.haveWriteAccess"
          @open-file="clickedFile"
          @open-directory="clickedDirectory"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';

import DirectoryListView from '@/components/DirectoryListView.vue';
import WorkspaceFileView from '@/components/WorkspaceFileView.vue';
import WorkspaceDirectoryView from '@/components/WorkspaceDirectoryView.vue';

const { Directory, File, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: { DirectoryListView, WorkspaceFileView, WorkspaceDirectoryView },
  data() {
    return {
      activeFile: null,
      activeDirectory: null,
      activePath: '',
      workspaceDetail: {},
      directoryDetail: {},
      organizationDetail: undefined,
      slug: '',
      openMessage: '',
    };
  },
  async created() {
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
      console.log(`Not found: ${this.slug} ${this.$route.params.wsname} combo not found in workspaces.`);
      this.$router.push({ name: 'PageNotFound' });
      return;
    }
    if (this.workspaceDetail.open) {
      this.openMessage = "Open (shared with public)"
      if (this.workspace.license) {
        this.openMessage += " under license " + this.workspace.license;
      }
    }
    this.directoryDetail = await Directory.get(this.workspace?.rootDirectory?._id);
    if (!this.organization) {
      this.organizationDetail = await Organization.get(this.workspace.organizationId);
    }
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      if (this.workspace.organization.type !== 'Open') {
        if (this.userRouteFlag) {
          this.$router.push({ name: 'PermissionError', params: {slug: this.slug, urlCode: `/user/${this.slug}/workspace/${this.workspaceRefName}`}})
        } else {
          this.$router.push({ name: 'PermissionError', params: {slug: this.slug, urlCode: `/org/${this.slug}/workspace/${this.workspaceRefName}`}})
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
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization', 'getWorkspaceByNamePrivate', 'getUserByIdOrNamePublic']),
    async clickedFile(fileSubDocs, filePath) {
      let file = File.getFromStore(fileSubDocs._id);
      if (!file) {
        await File.get(fileSubDocs._id);
        file = File.getFromStore(fileSubDocs._id);
      }
      this.activeDirectory = null;
      this.activeFile = file;
      this.activePath = filePath;
    },
    async clickedDirectory(directorySubDocs, dirPath) {
      let directory = Directory.getFromStore(directorySubDocs._id);
      if (!directory) {
        await Directory.get(directorySubDocs._id);
        directory = Directory.getFromStore(directorySubDocs._id);
      }
      this.activeFile = null;
      this.activeDirectory = directory;
      this.activePath = dirPath;
    },
    async goHome() {
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaces', params: { id: this.slug } });
      } else {
        this.$router.push({ name: 'OrganizationWorkspaces', params: { id: this.slug } });
      }
    },
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

