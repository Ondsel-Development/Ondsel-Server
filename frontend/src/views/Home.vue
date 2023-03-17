<template>
<!--  <ModelViewer />-->
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="auto"
    >
        <v-card class="mx-auto" min-width="600">
          <div ref="dropzone">
            <v-card-item>
              <div class="text-center">
                <div class="text-h6 mt-6">
                  <v-icon icon="mdi-cloud-upload"></v-icon> Drag file to upload or <v-btn id="dropzone-click-target">BROWSE</v-btn>
                </div>
                <div class="text-caption mt-2 mb-6">Allowed extensions: FCSTD</div>
              </div>
            </v-card-item>
          </div>
        </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Dropzone from "dropzone";
import { v4 as uuidv4 } from 'uuid';

import ModelViewer from "@/components/ModelViewer";
import { mapState } from 'vuex'

export default {
  name: 'HomeView',
  components: { ModelViewer },
  data: () => ({
    dialog: true,
  }),
  mounted() {
    new Dropzone(this.$refs.dropzone, this.dropzoneOptions);
  },
  computed: {
    ...mapState('auth', ['accessToken', 'user']),
    dropzoneOptions() {
      const h = import.meta.env.VITE_APP_API_URL;
      const vm = this;

      return {
        includeStyling: false,
        url: `${h}upload`,
        paramName: 'file',
        headers: {
          Authorization: vm.accessToken,
        },
        previewTemplate: vm.template(),
        acceptedFiles: '.OBJ,.FCSTD',
        clickable: '#dropzone-click-target',
        dictDefaultMessage: 'amrit',
        renameFile: file => `${uuidv4()}.${file.name.split('.').pop()}`,
        init() {
          this.on("addedfile", file => {
            console.log(file);
            console.log(`File added: ${file.name}`);
          });
          this.on('uploadprogress', (file, progress) => {
            console.log('progress', file, progress);
          });
          this.on('success', file => {
            console.log('success');
          });
          this.on('error', (file, message) => {
            console.log('error', 'message');
          })
        }
      }
    }
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
  }
}
</script>

<style scoped>
</style>
