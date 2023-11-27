<template>
  <v-container v-if="workspace">
    <v-row class="align-center">
      <div class="text-body-1">Workspace&nbsp</div>
      <div class="text-body-1 font-weight-bold">{{ workspace.name }}</div>
      <v-spacer />
      <div class="align-end">
        <v-btn flat icon="mdi-pencil"></v-btn>
      </div>
    </v-row>
    <v-row>
      <v-col cols="3">
        <directory-list-view
          v-if="directory"
          :directory="directory"
          :parent-directory-path="directory.name"
          @selected-file="clickedFile"
          @selected-directory="clickedDirectory"
        />
      </v-col>
      <v-col cols="9">
        <WorkspaceFileView v-if="activeFile" :file="activeFile" />
        <WorkspaceDirectoryView v-else :directory="activeDirectory" />
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
    };
  },
  async created() {
    await Workspace.get(this.$route.params.id);
    await Directory.get(this.workspace.rootDirectory._id);
    console.log(this.workspace);
    console.log(this.currentOrganization);
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      await Organization.get(this.workspace.organizationId);
      const organization = Organization.getFromStore(this.workspace.organizationId);
      this.setCurrentOrganization(organization);
    }
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    directory: (vm) => Directory.getFromStore(vm.workspace.rootDirectory._id),
    workspace: (vm) => Workspace.getFromStore(vm.$route.params.id),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
    async clickedFile(fileSubDocs) {
      let file = File.getFromStore(fileSubDocs._id);
      if (!file) {
        await File.get(fileSubDocs._id);
      }
      this.activeDirectory = null;
      this.activeFile = File.getFromStore(fileSubDocs._id);
    },
    async clickedDirectory(directorySubDocs) {
      let directory = Directory.getFromStore(directorySubDocs._id);
      if (!directory) {
        await Directory.get(directorySubDocs._id);
      }
      this.activeFile = null;
      this.activeDirectory = Directory.getFromStore(directorySubDocs._id);
    }
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

