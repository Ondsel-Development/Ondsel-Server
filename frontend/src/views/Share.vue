<template>
  <v-navigation-drawer rail location="right" permanent>
    <v-btn icon flat @click="dialog = true">
      <v-icon icon="mdi-file"></v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >File info</v-tooltip>
    </v-btn>
    <v-btn icon flat @click="fitModelToScreen">
      <v-icon>mdi-magnify</v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >Fit all or selection</v-tooltip>
    </v-btn>
    <v-btn icon flat @click="openAttributeViewer" v-if="sharedModel && (sharedModel.canViewModelAttributes || sharedModel.canUpdateModel)">
      <v-icon>mdi-view-list</v-icon>
      <v-tooltip
        activator="parent"
        location="start"
      >See model attributes</v-tooltip>
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
      <div>
        <v-card class="mx-auto" min-width="600">
          <v-card-item>
            <v-alert
              variant="outlined"
              type="error"
              border="top"
              class="text-left"
              v-if="error === 'NotFound'"
            >
              <span>Oops! The share link you're looking for could not be found.</span>
            </v-alert>
          </v-card-item>
          <v-card-item v-if="model">
            <v-alert
              v-if="!sharedModel.canViewModel"
              variant="outlined"
              type="warning"
              border="top"
              class="text-left"
            >
              Don't have permissions to view model.
            </v-alert>
            <v-card
              v-else
              class="mx-auto"
              variant="outlined"
            >
              <v-card-item>
                <v-container>
                  <v-row>
                    <v-icon icon="mdi-file" size="x-large"></v-icon>
                      <div class="text-subtitle-2">
                        {{ model.customerFileName || sharedModel.model.file.custFileName }}
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
          <v-card-actions class="justify-center">
            <v-btn icon flat @click="dialog = false" :disabled="!isModelLoaded">
              <v-icon icon="mdi-close-circle-outline" size="x-large"></v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
  <AttributeViewer
    v-if="model"
    :is-active="isAttributeViewerActive"
    :attributes="model.attributes"
    :is-obj-generated="model.isObjGenerated"
    :is-model-loaded="isModelLoaded"
    :can-view-model-attributes="sharedModel.canViewModelAttributes"
    :can-update-model="sharedModel.canUpdateModel"
    ref="attributeViewer"
    @update-model="updateModel"
  />
  <ExportModelDialog
    v-if="model"
    :is-active="isExportModelDialogActive"
    :shared-model="sharedModel"
    :shared-model-sub-model="model"
    ref="exportModelDialog"
    @update-model="updateModel"
  />
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';

import ModelViewer from "@/components/ModelViewer";
import AttributeViewer from '@/components/AttributeViewer';
import ExportModelDialog from '@/components/ExportModelDialog';

const { SharedModel, Model } = models.api;

export default {
  name: 'ShareView',
  components: { AttributeViewer, ModelViewer, ExportModelDialog },
  data: () => ({
    dialog: true,
    sharedModel: null,
    model: null,
    uploadInProgress: false,
    isModelLoaded: false,
    isAttributeViewerActive: false,
    isExportModelDialogActive: false,
    isReloadingOBJ: false,
    error: '',
  }),
  async created() {
    const shareModelId = this.$route.params.id;
    if (shareModelId) {
      try {
        this.sharedModel = await SharedModel.get(shareModelId, {query: {isActive: true}});
      } catch (error) {
        this.error = 'NotFound';
      }

      if (this.isAuthenticated) {
        if (
          this.sharedModel.canUpdateModel ||
          this.sharedModel.canExportFCStd ||
          this.sharedModel.canExportSTEP ||
          this.sharedModel.canExportSTL ||
          this.sharedModel.canExportOBJ
        ) {
          this.sharedModel = await this.sharedModel.patch({ data: { shouldCreateInstance: true }});
        }
        // Need to fetch model separately for reactivity for watcher
        this.model = await Model.get(this.sharedModel.model._id, {query: {isSharedModel: true}});
      } else {
        this.model = this.sharedModel.model;
      }
    }
  },
  computed: {
    ...mapState('auth', ['accessToken', 'user']),
    ...mapGetters('auth', ['isAuthenticated'])
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
    async updateModel() {
      this.isReloadingOBJ = true;
      this.isModelLoaded = false;
      this.model.isObjGenerated = false;
      this.model.shouldStartObjGeneration = true;

      this.sharedModel.model.isObjGenerated = this.model.isObjGenerated;
      this.sharedModel.model.shouldStartObjGeneration = this.model.shouldStartObjGeneration;
      this.sharedModel.model.attributes = this.model.attributes;

      this.sharedModel = await this.sharedModel.save();
    },
    async uploadThumbnail() {

      if (!this.isAuthenticated || this.sharedModel.thumbnailUrl) {
        return
      }
      const modelId = this.sharedModel.dummyModelId;

      try {
        this.$nextTick(async () => {
          const canvas = document.getElementsByTagName('canvas')[0];
          const image = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

          const fd = new FormData();
          fd.append('file', image, `${modelId}_thumbnail.PNG`);
          const uploadUrl = `${import.meta.env.VITE_APP_API_URL}upload`;

          await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              Authorization: this.accessToken,
            },
            body: fd,
          });
          await this.sharedModel.patch({
            data: {
              model: {
                _id: this.sharedModel.dummyModelId,
                isThumbnailGenerated: true,
              }
            }
          })
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
  watch: {
    async 'model.isObjGenerated'(v) {
      if (this.sharedModel.canViewModel && v) {
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
