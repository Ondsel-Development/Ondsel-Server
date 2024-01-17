<template>
  <v-container fluid class="mt-4">
    <v-row>
      <v-spacer />
      <a
        v-if="file.modelId"
        :href="fileModelUrl"
        target="blank"
        style="text-decoration: none; color: inherit;"
      >
        <v-btn flat>Explore</v-btn>
      </a>
      <v-btn
        :disabled="isFileDownloadInProgress"
        :loading="isFileDownloadInProgress"
        @click="downloadFile(file.currentVersion.uniqueFileName, file.custFileName)"
        flat
      >
        Download Active
      </v-btn>
      <v-btn
        flat
        :disabled="!canUserWrite"
        @click="$refs.deleteFile.openDeleteFileDialog();"
      >
        Delete File
      </v-btn>
      <v-btn
        flat
        :disabled="!canUserWrite"
        @click="$refs.uploadNewVersionFile.openFileUploadDialog();"
      >Upload New Version</v-btn>
    </v-row>
    <v-row class="mt-10">
      <v-img
        v-if="file.model && file.model.thumbnailUrlCache"
        height="400"
        :src="file.model.thumbnailUrlCache"
        cover
      ></v-img>
      <v-sheet
        v-else
        color="#F4F4F4"
        height="400"
        width="100%"
        class="d-flex justify-center align-center"
      >
        <v-icon icon="mdi-file" style="color: #8D8D8D" cover />
      </v-sheet>
    </v-row>
    <v-row>
      <file-versions-table :file="file" :can-user-write="canUserWrite" />
    </v-row>
    <upload-new-version-file-dialog ref="uploadNewVersionFile" :file="file" />
    <delete-file-dialog ref="deleteFile" :file="file" @done-with-file="doneWithFile" />
  </v-container>
</template>

<script>
import FileVersionsTable from '@/components/FileVersionsTable.vue';
import UploadNewVersionFileDialog from '@/components/UploadNewVersionFileDialog.vue';
import DeleteFileDialog from "@/components/DeleteFileDialog.vue";
import fileDownloadMixin from '@/mixins/fileDownloadMixin';
import {mapActions} from "vuex";

export default {
  name: 'WorkspaceFileView',
  components: {FileVersionsTable, UploadNewVersionFileDialog, DeleteFileDialog},
  props: {
    file: Object,
    canUserWrite: {
      type: Boolean,
      default: false,
    },
    fullPath: String,
    publicView: Boolean,
  },
  emits: ['openDirectory'],
  mixins: [fileDownloadMixin],
  data: () => ({}),
  computed: {
    fileModelUrl: vm => `${window.location.origin}/model/${vm.file.modelId}`,
  },
  methods: {
    async doneWithFile() {
      // if invoked by a child, then this FileView should close and this file's directory should be displayed
      const dir = this.file.directory;
      let rootPath = this.fullPath.substring(0, this.fullPath.lastIndexOf("/"));
      if (rootPath==="") rootPath = "/";
      this.$emit('openDirectory', dir, rootPath);
    }
  },
}
</script>

<style scoped>

</style>
