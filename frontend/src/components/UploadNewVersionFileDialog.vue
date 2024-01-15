<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Upload new version file</div>
      </template>
      <v-card-text>
        <v-text-field
          v-model.trim="commitMessage"
          label="Commit Message"
          hint="Enter commit message"
          :rules="[rules.isRequired]"
        ></v-text-field>
        <v-card
          v-if="newFile"
          class="mx-auto mb-2"
          variant="outlined"
        >
          <v-card-item>
            <v-container>
              <v-row>
                <v-icon icon="mdi-file" size="x-large"></v-icon>
                <div class="text-subtitle-2">
                  {{ newFile.name }}
                </div>
              </v-row>
              <v-row>
                <v-progress-linear indeterminate v-if="isFileUploadInProgress"></v-progress-linear>
                <v-progress-linear model-value="100" v-else></v-progress-linear>
              </v-row>
              <v-row>
                <div class="text-caption" v-if="isFileUploadInProgress">File uploading...</div>
                <div class="text-caption" v-else-if="error === 'InvalidFileType'">Invalid file type extension</div>
                <div class="text-caption" v-else-if="error">Internal Server Error</div>
                <div class="text-caption" v-else>File successfully uploaded</div>
              </v-row>
            </v-container>
          </v-card-item>
        </v-card>
        <div class="text-center" ref="dropzone">
          <div class="text-h6 mt-6">
            <v-icon icon="mdi-cloud-upload"></v-icon> Drag file to upload or <v-btn id="dropzone-click-target">BROWSE</v-btn>
          </div>
          <div class="text-caption mt-2 mb-6">Allowed extension: {{ acceptedFiles }}</div>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!(commitMessage && newFile && !error && !isFileUploadInProgress)"
          :loading="isPatchPending"
          @click="commitNewVersion"
        >Upload</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import rules from '@/mixins/rules';
import { v4 as uuidv4 } from 'uuid';
import { mapState } from 'vuex';
import Dropzone from 'dropzone';

export default {
  name: "UploadNewVersionFileDialog",
  mixins: [rules],
  props: {
    file: Object,
  },
  data: () => ({
    dialog: false,
    commitMessage: '',
    newFile: null,
    dropzone: null,
    error: null,
    isFileUploadInProgress: false,
  }),
  computed: {
    ...mapState('auth', ['accessToken']),
    ...mapState('file', ['isPatchPending']),
    acceptedFiles: vm => `.${vm.file.custFileName.split('.').pop().toUpperCase()}`,
    dropzoneOptions() {
      const h = import.meta.env.VITE_APP_API_URL;
      const vm = this;

      return {
        includeStyling: false,
        url: `${h}upload`,
        paramName: 'file',
        parallelUploads: 1,
        maxFiles: 1,
        acceptedFiles: vm.acceptedFiles,
        headers: {
          Authorization: vm.accessToken,
        },
        previewTemplate: vm.template(),
        clickable: '#dropzone-click-target',
        renameFile: file => `${uuidv4()}.${file.name.split('.').pop()}`,
        init() {
          this.on("addedfile", async file => {
            vm.newFile = file;
            vm.error = null;
            vm.isFileUploadInProgress = true;
          });
          this.on('success', async file => {
            vm.newFile = file;
            vm.isFileUploadInProgress = false;
          });
          // eslint-disable-next-line no-unused-vars
          this.on('error', (file, message) => {
            vm.newFile = file;
            vm.error = message;
            if (!file.accepted) {
              vm.error = 'InvalidFileType';
            }
            vm.isFileUploadInProgress = false;
          })
        }
      }
    },
  },
  methods: {
    template() {
      return `<div class="dz-preview dz-file-preview" style="display: none;">
                <div class="dz-details">
                  <div class="dz-filename"><span data-dz-name></span></div>
                  <div class="dz-size" data-dz-size></div>
                  <img data-dz-thumbnail />
                </div>
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                <div class="dz-success-mark"><span>✔</span></div>
                <div class="dz-error-mark"><span>✘</span></div>
                <div class="dz-error-message"><span data-dz-errormessage></span></div>
              </div>
        `;
    },
    openFileUploadDialog() {
      this.newFile = null;
      this.dialog = true;
      // Use Vue.nextTick to ensure that the DOM has been updated
      this.$nextTick(() => {
        // If a Dropzone instance already exists, destroy it
        if (this.dropzone) {
          this.dropzone.destroy();
          this.dropzone = null; // Set to null to ensure a new instance is created
        }
        // Initialize Dropzone on the dropzone container
        this.dropzone = new Dropzone(this.$refs.dropzone, this.dropzoneOptions);
      });
    },
    async commitNewVersion() {
      await this.file.patch({
        data: {
          shouldCommitNewVersion: true,
          version: {
            uniqueFileName: this.newFile.upload.filename,
            message: this.commitMessage,
          }
        }
      });
      this.dialog = false;
      this.newFile = null;
      this.error = null;
    }
  }
}
</script>

<style scoped>

</style>
