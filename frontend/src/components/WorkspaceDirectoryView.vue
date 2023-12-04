<template>
  <v-container v-if="directory" class="mt-4">
    <v-row>
      <v-spacer />
      <v-btn flat  @click="$refs.uploadFileDialog.openFileUploadDialog();">Add New File</v-btn>
      <v-btn flat @click="$refs.createDirectoryDialog.$data.dialog=true;">Create Directory</v-btn>
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
    <v-row v-if="!(directory.files.length && directory.directories)">
      <v-col>
        <div class="text-body-2 text-center" style="text-align: center; justify-content: center">
          No item exist!
        </div>
      </v-col>
    </v-row>
    <upload-file-dialog ref="uploadFileDialog" :directory="directory" />
    <create-directory-dialog ref="createDirectoryDialog" @create-directory="createDirectory"/>
  </v-container>
</template>

<script>
import CreateDirectoryDialog from '@/components/CreateDirectoryDialog.vue';
import UploadFileDialog from '@/components/UploadFileDialog.vue';
import { models } from '@feathersjs/vuex';

const { Directory } = models.api;

export default {
  name: "WorkspaceDirectoryView",
  emits: ['openFile', 'openDirectory'],
  props: {
    directory: Object,
    directoryPath: String,
  },
  components: { CreateDirectoryDialog, UploadFileDialog },
  data: () => ({
    directoryDialog: false,
  }),
  methods: {
    async createDirectory(directoryName) {
      const directory = await Directory.create({
        name: directoryName,
        workspace: this.directory.workspace
      });
      await Directory.patch(
        this.directory._id,
        {
          shouldAddDirectoriesToDirectory: true,
          directoryIds: [directory._id.toString()]
        }
      )
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
