<template>
  <v-navigation-drawer rail location="right" permanent>
    <v-btn icon flat @click="dialog = true">
      <v-icon icon="mdi-file"></v-icon>
    </v-btn>
    <v-btn icon flat @click="fitModelToScreen">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <v-btn icon flat @click="$emit('openAttributeViewerDialog', true)">
      <v-icon>mdi-view-list</v-icon>
    </v-btn>
  </v-navigation-drawer>
  <ModelViewer v-if="model && model.objUrl" ref="modelViewer" :obj-url="model.objUrl"/>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="auto"
      persistent
    >
      <div ref="dropzone">
        <v-card class="mx-auto" min-width="600">
          <v-card-item v-if="model">
            <v-card
              class="mx-auto"
              variant="outlined"
            >
              <v-card-item>
                <v-container>
                  <v-row>
                    <v-icon icon="mdi-file" size="x-large"></v-icon>
                      <div class="text-subtitle-2">
                        {{ model.custFileName }}
                      </div>
                  </v-row>
                  <v-row>
                    <v-progress-linear model-value="100" v-if="isModelLoaded"></v-progress-linear>
                    <v-progress-linear indeterminate v-else></v-progress-linear>
                  </v-row>
                  <v-row>
                    <div class="text-caption" v-if="uploadInProgress">File uploading...</div>
                    <div class="text-caption" v-else-if="model.isObjGenerationInProgress">Creating Mesh...</div>
                    <div class="text-caption" v-else-if="model.isObjGenerated && !isModelLoaded">Mesh generated, loading...</div>
                    <div class="text-caption" v-else-if="isModelLoaded">Loaded</div>
                  </v-row>
                </v-container>
              </v-card-item>
            </v-card>
          </v-card-item>
          <div>
            <v-card-item>
              <div class="text-center">
                <div class="text-h6 mt-6">
                  <v-icon icon="mdi-cloud-upload"></v-icon> Drag file to upload or <v-btn id="dropzone-click-target">BROWSE</v-btn>
                </div>
                <div class="text-caption mt-2 mb-6">Allowed extensions: FCSTD, OBJ</div>
              </div>
            </v-card-item>
          </div>
          <v-card-actions class="justify-center">
            <v-btn icon flat @click="dialog = false" :disabled="!isModelLoaded">
              <v-icon icon="mdi-close-circle-outline" size="x-large"></v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import Dropzone from "dropzone";
import { v4 as uuidv4 } from 'uuid';
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

import ModelViewer from "@/components/ModelViewer";

const { Model } = models.api;

export default {
  name: 'HomeView',
  components: { ModelViewer },
  data: () => ({
    dialog: true,
    model: null,
    uploadInProgress: false,
    isModelLoaded: false,
  }),
  mounted() {
    new Dropzone(this.$refs.dropzone, this.dropzoneOptions);
  },
  async created() {
    const modelId = this.$route.params.id;
    if (modelId) {
      this.model = await Model.get(modelId);
    }
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
        parallelUploads: 1,
        headers: {
          Authorization: vm.accessToken,
        },
        previewTemplate: vm.template(),
        acceptedFiles: '.OBJ,.FCSTD',
        clickable: '#dropzone-click-target',
        renameFile: file => `${uuidv4()}.${file.name.split('.').pop()}`,
        init() {
          this.on("addedfile", file => {
            vm.uploadInProgress = true;
            console.log(file);
            vm.model = new Model({
              uniqueFileName: file.upload.filename,
              custFileName: file.name,
            })
            file.model = vm.model;
          });
          this.on('success', async file => {
            await file.model.save();
            vm.$router.replace(`/${vm.model._id}`);
            await vm.model.patch({
              id: vm.model._id,
              data: {
                shouldStartObjGeneration: true,
                uniqueFileName: vm.uniqueFileName,
              }
            })
            vm.uploadInProgress = false;
          });
          this.on('error', (file, message) => {
          })
        }
      }
    }
  },
  methods: {
    fitModelToScreen() {
      this.$refs.modelViewer.fitModelToScreen();
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
  },
  watch: {
    'model.isObjGenerated'(v) {
      if (v) {
        setTimeout(async () => {
          this.dialog = false;
          this.isModelLoaded = true;
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>
</style>
