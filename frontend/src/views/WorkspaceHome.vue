<template>
  <v-container v-if="workspace">
    <v-row class="align-center">
      <div class="text-body-1">Workspace&nbsp</div>
      <div class="text-body-1 font-weight-bold">{{ workspace.name }}</div>
<!--      <v-spacer />-->
<!--      <div class="align-end">-->
<!--        <v-btn flat icon="mdi-pencil"></v-btn>-->
<!--      </div>-->
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
        <WorkspaceFileView v-if="activeFile" :file="activeFile" />
        <WorkspaceDirectoryView
          v-else
          :directory="activeDirectory || directory"
          :directoryPath="activePath === '/' ? '' : activePath"
          @open-file="clickedFile"
          @open-directory="clickedDirectory"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';

import DirectoryListView from '@/components/DirectoryListView.vue';
import WorkspaceFileView from '@/components/WorkspaceFileView.vue';
import WorkspaceDirectoryView from '@/components/WorkspaceDirectoryView.vue';

const { Directory, Workspace, File, Organization } = models.api;

export default {
  name: 'WorkspaceHome',
  components: { DirectoryListView, WorkspaceFileView, WorkspaceDirectoryView },
  data() {
    return {
      activeFile: null,
      activeDirectory: null,
      activePath: '',
    };
  },
  async created() {
    await Workspace.get(this.$route.params.id);
    await Directory.get(this.workspace.rootDirectory._id);
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      await Organization.get(this.workspace.organizationId);
      const organization = Organization.getFromStore(this.workspace.organizationId);
      await this.setCurrentOrganization(organization);
    }
    this.activePath = this.directory.name;
  },
  async mounted() {
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    directory: (vm) => Directory.getFromStore(vm.workspace.rootDirectory._id),
    workspace: (vm) => Workspace.getFromStore(vm.$route.params.id),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
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
    }
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

