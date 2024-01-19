<template>
  <v-container v-if="directory" class="mt-4">
    <v-row>
      <v-spacer />
      <v-btn flat :disabled="!canUserWrite" @click="$refs.uploadFileDialog.openFileUploadDialog();">Add New File</v-btn>
      <v-btn flat class="ml-1" :disabled="!canUserWrite" @click="$refs.createDirectoryDialog.$data.dialog=true;">Create Directory</v-btn>
      <v-btn v-if="directory.name!=='/'" flat class="ml-1" :disabled="!canUserWrite" @click="$refs.deleteDirectoryDialog.$data.dialog=true;">Delete Directory</v-btn>
    </v-row>
    <v-row class="mt-10" dense>
      <v-col cols="3" v-for="file in directory.files" :key="file._id">
        <v-card class="mx-auto" height="220" @click="$emit('openFile', file, `${directoryPath}/${file.custFileName}`)">
          <v-sheet
            color="#F4F4F4"
            height="150px"
            class="d-flex justify-center align-center"
          >
            <v-icon icon="mdi-file" style="color: #8D8D8D" cover />
          </v-sheet>
          <v-card-text>
            <div class="text-body-2 text-center">{{ file.custFileName }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3" v-for="dir in directory.directories" :key="dir._id">
        <v-card class="mx-auto" height="220" @click="openDirectory(dir)">
          <v-sheet
            color="#F4F4F4"
            height="150px"
            class="d-flex justify-center align-center"
          >
            <v-icon icon="mdi-folder" style="color: #8D8D8D" cover />
          </v-sheet>
          <v-card-text class="text-body-2 text-center">
            {{ dir.name }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="!(directory.files?.length && directory.directories)">
      <v-col>
        <div class="text-body-2 text-center" style="text-align: center; justify-content: center">
          There are no files in this directory
        </div>
      </v-col>
    </v-row>
    <upload-file-dialog ref="uploadFileDialog" :directory="directory" />
    <create-directory-dialog ref="createDirectoryDialog" @create-directory="createDirectory"/>
    <delete-directory-dialog ref="deleteDirectoryDialog" :directory-name="directory.name" @delete-directory="deleteThisDirectory"/>
  </v-container>
</template>

<script>
import CreateDirectoryDialog from '@/components/CreateDirectoryDialog.vue';
import UploadFileDialog from '@/components/UploadFileDialog.vue';
import { models } from '@feathersjs/vuex';
import DeleteDirectoryDialog from "@/components/DeleteDirectoryDialog.vue";

const { Directory } = models.api;

export default {
  name: "WorkspaceDirectoryView",
  emits: ['openFile', 'openDirectory'],
  props: {
    directory: Object,
    directoryPath: String,
    canUserWrite: {
      type: Boolean,
      default: false,
    }
  },
  components: {DeleteDirectoryDialog, CreateDirectoryDialog, UploadFileDialog },
  data: () => ({
    directoryDialog: false,
  }),
  methods: {
    async deleteThisDirectory() {
      await Directory.remove(
        this.directory._id
      ).then(() => {
        let rootPath = this.directoryPath.substring(0, this.directoryPath.lastIndexOf("/"));
        if (rootPath==="") rootPath = "/";
        this.$emit('openDirectory', this.directory.parentDirectory, rootPath);
        this.$refs.deleteDirectoryDialog.$data.dialog = false;
      }).catch((e) => {
        this.$refs.deleteDirectoryDialog.$data.snackerMsg = e.message;
        this.$refs.deleteDirectoryDialog.$data.showSnacker = true;
      });
    },
    async createDirectory(directoryName) {
      try {
        await Directory.create({
          name: directoryName,
          workspace: this.directory.workspace,
          parentDirectory: {
            _id: this.directory._id,
            name: this.directory.name,
          }
        });
      } catch (e) {
        const msg = e.message;
        this.$refs.createDirectoryDialog.$data.snackerMsg = msg;
        this.$refs.createDirectoryDialog.$data.showSnacker = true;
        return;
      }
      this.$refs.createDirectoryDialog.$data.dialog = false;
    },
    async openDirectory(dirSubDocs) {
      await Directory.get(dirSubDocs._id);
      const dir = Directory.getFromStore(dirSubDocs._id);
      this.$emit('openDirectory', dir, `${this.directoryPath}/${dir.name}`);
    }
  }
}
</script>

<style scoped>

</style>
