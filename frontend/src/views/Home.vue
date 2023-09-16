<template>
  <v-navigation-drawer rail location="right" permanent>
    <v-btn icon flat @click="dialog = true">
      <v-icon icon="mdi-file"></v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >Open a file</v-tooltip>
    </v-btn>
    <v-btn icon flat @click="fitModelToScreen">
      <v-icon>mdi-magnify</v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >Fit all or selection</v-tooltip>
    </v-btn>
    <v-btn icon flat @click="openAttributeViewer">
      <v-icon>mdi-view-list</v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >See model attributes</v-tooltip>
    </v-btn>
    <v-btn icon flat @click="sharedModelDrawerClicked">
      <v-icon>mdi-format-list-checks</v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >Manage share link</v-tooltip>
    </v-btn>
    <v-btn icon flat @click="openExportModelDialog">
      <v-icon>mdi-file-export</v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >Export model</v-tooltip>
    </v-btn>
  </v-navigation-drawer>
  <ModelViewer ref="modelViewer" @load:mesh="uploadThumbnail"/>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="auto"
      persistent
    >
      <div ref="dropzone">
        <v-card class="mx-auto" min-width="600">
          <v-card-item>
            <v-alert
              variant="outlined"
              type="error"
              border="top"
              class="text-left"
              v-if="model && model.latestLogErrorIdForObjGenerationCommand"
            >
              <span>Internal server error occurred!</span>
            </v-alert>
            <v-alert
              variant="outlined"
              type="error"
              border="top"
              class="text-left"
              v-if="error === 'NotFound'"
            >
              <span>Oops! The model you're looking for could not be found.</span>
            </v-alert>
            <v-alert
              variant="outlined"
              type="error"
              border="top"
              class="text-left"
              v-else-if="error === 'InvalidFileType'"
            >
              <span>Only *.FCStd and *.OBJ files accepted.</span>
            </v-alert>
            <v-alert
              variant="outlined"
              type="error"
              border="top"
              class="text-left"
              v-else-if="error === 'UpgradeTier'"
            >
              <span>Please upgrade your tier.</span>
            </v-alert>
          </v-card-item>
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
                        {{ model.customerFileName }}
                      </div>
                  </v-row>
                  <v-row>
                    <v-progress-linear model-value="100" v-if="isModelLoaded || model.latestLogErrorIdForObjGenerationCommand || error"></v-progress-linear>
                    <v-progress-linear indeterminate v-else></v-progress-linear>
                  </v-row>
                  <v-row>
                    <div class="text-caption" v-if="uploadInProgress">File uploading...</div>
                    <div class="text-caption" v-else-if="model.isObjGenerationInProgress && !model.latestLogErrorIdForObjGenerationCommand">Creating Mesh...</div>
                    <div class="text-caption" v-else-if="model.isObjGenerated && !isModelLoaded">Mesh generated, loading...</div>
                    <div class="text-caption" v-else-if="isModelLoaded || model.latestLogErrorIdForObjGenerationCommand">Loaded</div>
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
            <v-btn v-if="model && !error" icon flat @click="dialog = false">
              <v-icon icon="mdi-close-circle-outline" size="x-large"></v-icon>
            </v-btn>
            <v-btn v-else icon flat :to="{ name: 'Models' }">
              <v-icon icon="mdi-arrow-left" size="x-large"></v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
    <AttributeViewer
      v-if="model"
      :is-active="isAttributeViewerActive"
      :attributes="model.attributes"
      :is-obj-generated="model.isObjGenerated"
      :is-model-loaded="isModelLoaded"
      ref="attributeViewer"
      @update-model="updateModel"
    />
    <ExportModelDialog
      v-if="model"
      :is-active="isExportModelDialogActive"
      :model="model"
      ref="exportModelDialog"
    />
    <v-navigation-drawer
      v-model="manageSharedModelsDrawer"
      location="right"
      width="1100"
      temporary
    >
      <MangeSharedModels :model="model"/>
    </v-navigation-drawer>
  </div>
</template>

<script>
import Dropzone from "dropzone";
import { v4 as uuidv4 } from 'uuid';
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

import ModelViewer from '@/components/ModelViewer';
import AttributeViewer from '@/components/AttributeViewer';
import ExportModelDialog from '@/components/ExportModelDialog';
import MangeSharedModels from '@/components/MangeSharedModels';

const { Model, SharedModel } = models.api;

export default {
  name: 'HomeView',
  components: { AttributeViewer, MangeSharedModels, ModelViewer, ExportModelDialog },
  data: () => ({
    dialog: true,
    model: null,
    uploadInProgress: false,
    isModelLoaded: false,
    isAttributeViewerActive: false,
    isShareModelDialogActive: false,
    isExportModelDialogActive: false,
    isReloadingOBJ: false,
    error: '',
    manageSharedModelsDrawer: false,
  }),
  mounted() {
    new Dropzone(this.$refs.dropzone, this.dropzoneOptions);
  },
  async created() {
    const modelId = this.$route.params.id;
    if (modelId) {
      try {
        this.model = await Model.get(modelId, {query: {'isSharedModel': false}});
      } catch (error) {
        this.error = 'NotFound';
      }
      if (this.model && !this.model.objUrl) {
        await this.model.patch({
          data: {
            shouldStartObjGeneration: true,
            uniqueFileName: this.model.uniqueFileName,
          }
        })
      }
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
            vm.model = new Model({
              uniqueFileName: file.upload.filename,
              custFileName: file.name,
            })
            file.model = vm.model;
          });
          this.on('success', async file => {
            try {
              await file.model.save();
              vm.$router.replace(`/model/${vm.model._id}`);
              await vm.model.patch({
                id: vm.model._id,
                data: {
                  shouldStartObjGeneration: true,
                  uniqueFileName: vm.uniqueFileName,
                }
              })
              vm.uploadInProgress = false;
            } catch (e) {
              vm.error = 'UpgradeTier';
            }
          });
          this.on('error', (file, message) => {
            if (!file.accepted) {
              vm.error = 'InvalidFileType';
            }
          })
        }
      }
    }
  },
  methods: {
    fitModelToScreen() {
      this.$refs.modelViewer.fitModelToScreen();
    },
    openAttributeViewer() {
      this.$refs.attributeViewer.$data.dialog = true;
    },
    openExportModelDialog() {
      this.$refs.exportModelDialog.$data.dialog = true;
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
    async updateModel() {
      this.isReloadingOBJ = true;
      this.model.isObjGenerated = false;
      this.isModelLoaded = false;
      this.model.shouldStartObjGeneration = true;
      this.model = await this.model.save();
    },
    uploadThumbnail() {

      if (this.model.isThumbnailGenerated) {
        return
      }

      try {
        this.$nextTick(async () => {
          const canvas = document.getElementsByTagName('canvas')[0];
          const image = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

          const fd = new FormData();
          fd.append('file', image, `${this.model._id}_thumbnail.PNG`);
          const uploadUrl = `${import.meta.env.VITE_APP_API_URL}upload`;

          await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              Authorization: this.accessToken,
            },
            body: fd,
          });
          await this.model.patch({data: {isThumbnailGenerated: true}});
        });
      } catch (e) {
        console.error(e);
      }
    },
    async sharedModelDrawerClicked() {
      this.manageSharedModelsDrawer = !this.manageSharedModelsDrawer;
      await SharedModel.find({
        query: {
          cloneModelId: this.model._id,
          $paginate: false
        },
      })
    },
  },
  watch: {
    'model.isObjGenerated'(v) {
      if (v) {
        if (this.isReloadingOBJ) {
          this.$refs.modelViewer.reloadOBJ(this.model.objUrl);
        } else {
          this.$refs.modelViewer.init(this.model.objUrl);
        }

        setTimeout(async () => {
          if (this.isReloadingOBJ) {
            this.$refs.attributeViewer.$data.dialog = false;
            this.isReloadingOBJ = false;
          } else {
            this.dialog = false;
          }
          this.isModelLoaded = true;
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>
</style>
