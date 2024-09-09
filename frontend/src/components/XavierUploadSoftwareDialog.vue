<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-form v-model="isValid" @submit.prevent="commitNewVersion">
      <v-card width="500" max-height="800">
        <v-card-title><div class="text-center">Upload new file</div></v-card-title>
        <v-card-text>
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
              <v-icon icon="mdi-cloud-upload"></v-icon> Drag file to upload or <v-btn color="secondary" variant="elevated" id="dropzone-click-target">BROWSE</v-btn>
            </div>
          </div>
          <v-divider class="my-4"></v-divider>
          <span class="text-red">{{this.errorMsg}}</span>
          <v-text-field
            v-model="originalFilename"
            label="uploaded filename"
            readonly
            :rules="[rules.needsFile]"
          ></v-text-field>
          <v-select
            v-model="cadence"
            label="Cadence"
            :rules="[rules.isRequired]"
            :items="['stable', 'weekly-builds']"
          ></v-select>
          <v-select
            v-if="cadence==='stable'"
            v-model="releaseTarget"
            label="Release Target"
            :rules="[rules.confirmReleaseTarget]"
            :items="releaseFileTypes"
          ></v-select>
          <v-select
            v-if="cadence==='weekly-builds'"
            v-model="weeklyTarget"
            label="Weekly Build Target"
            :rules="[rules.confirmWeeklyTarget]"
            :items="weeklyFileTypes"
          ></v-select>
          <v-text-field
            v-if="cadence==='stable'"
            v-model="version"
            :rules="[rules.confirmVersion, rules.minCharacter]"
            label="Release Version"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            @click="clearFieldsCloseDialog()"
          >Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
          >Confirm Details</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import rules from '@/mixins/rules';
import { v4 as uuidv4 } from 'uuid';
import { mapState } from 'vuex';
import Dropzone from 'dropzone';
import {models} from "@feathersjs/vuex";

const { Publisher } = models.api;

export default {
  name: "XavierUploadSoftwareDialog",
  mixins: [rules],
  emits: ['uploadedFile'],
  props: {
    releaseFileTypes: {
      type: Array,
      default: [],
    },
    weeklyFileTypes: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      dialog: false,
      newFile: null,
      dropzone: null,
      error: null,
      isFileUploadInProgress: false,
      cadence: null,
      releaseTarget: null,
      weeklyTarget: null,
      version: null,
      warningMsg: '',
      errorMsg: '',
      disableUpload: true,
      isValid: true,
      originalFilename: '',
      rules: {
        isRequired: v => !!v || 'This field is required',
        needsFile: v => !!v || 'The file needs to be uploaded first',
        confirmReleaseTarget: v => this.checkReleaseTarget(v),
        confirmWeeklyTarget: v => this.checkWeeklyTarget(v),
        confirmVersion: v => this.checkVersion(v),
        minCharacter: v => (v && (v.length >= 8 || v.length===0)) || 'Minimum 8 characters',
      },
    }
  },
  computed: {
    ...mapState('auth', ['accessToken']),
    ...mapState('file', ['isPatchPending']),
    dropzoneOptions() {
      const h = import.meta.env.VITE_APP_API_URL;
      const vm = this;

      return {
        includeStyling: false,
        url: `${h}upload`,
        paramName: 'file',
        parallelUploads: 1,
        maxFiles: 1,
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
            vm.originalFilename = file.name;
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
            console.log(message);
            if (!file.accepted) {
              vm.error = 'InvalidFileType';
              vm.errorMsg = `Invalid File (${message})`
            }
            vm.isFileUploadInProgress = false;
          })
        }
      }
    },
  },
  methods: {
    clearFieldsCloseDialog() {
      this.cadence = null;
      this.releaseTarget = null;
      this.weeklyTarget = null;
      this.version = null;
      this.warningMsg = '';
      this.errorMsg = '';
      this.originalFilename = '';
      this.dialog = false;
    },
    checkReleaseTarget(rawText) {
      if (this.cadence === 'stable') {
        if (!rawText) {
          return "Target not chosen"
        }
        if (!this.originalFilename.includes(rawText)) {
          return "The filename is missing the target name."
        }
      }
      return true;
    },
    checkWeeklyTarget(rawText) {
      if (this.cadence === 'weekly-builds') {
        if (!rawText) {
          return "Target not chosen"
        }
        if (!this.originalFilename.includes(rawText)) {
          return "The filename is missing the target name."
        }
      }
      this.version = '';
      return true;
    },
    checkVersion(rawText) {
      if (this.cadence === 'stable') {
        if (!this.originalFilename.includes(rawText)) {
          return "The filename is missing the version version."
        }
      }
      return true;
    },
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
      if (this.isValid) {
        let target;
        if (this.cadence === 'stable') {
          target = this.releaseTarget;
        } else {
          target = this.weeklyTarget;
        }
        await Publisher.create({
          target: target,
          releaseCadence: this.cadence,
          release: this.version,
          filename: this.originalFilename,
          uploadedUniqueFilename: this.newFile.upload.filename,
        });
        this.$emit('uploadedFile');
        this.newFile = null;
        this.error = null;
        this.clearFieldsCloseDialog();
      }
    },
  },
}
</script>

<style scoped>

</style>
