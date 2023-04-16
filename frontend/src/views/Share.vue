<template>
  <v-navigation-drawer rail location="right" permanent>
    <v-btn icon flat @click="dialog = true">
      <v-icon icon="mdi-file"></v-icon>
    </v-btn>
    <v-btn icon flat @click="fitModelToScreen">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <v-btn icon flat @click="openAttributeViewer" v-if="sharedModel && (sharedModel.canViewModelAttributes || sharedModel.canUpdateModel)">
      <v-icon>mdi-view-list</v-icon>
    </v-btn>
  </v-navigation-drawer>
  <ModelViewer ref="modelViewer"/>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="auto"
      persistent
    >
      <div>
        <v-card class="mx-auto" min-width="600">
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
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';

import ModelViewer from "@/components/ModelViewer";
import AttributeViewer from '@/components/AttributeViewer';

const { SharedModel, Model } = models.api;

export default {
  name: 'ShareView',
  components: { AttributeViewer, ModelViewer },
  data: () => ({
    dialog: true,
    sharedModel: null,
    model: null,
    uploadInProgress: false,
    isModelLoaded: false,
    isAttributeViewerActive: false,
    isReloadingOBJ: false,
  }),
  async created() {
    const shareModelId = this.$route.params.id;
    if (shareModelId) {
      this.sharedModel = await SharedModel.get(shareModelId);
      if (this.isAuthenticated) {
        // Need to fetch model separately for reactivity for watcher
        this.model = await Model.get(this.sharedModel.modelId);
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
    async updateModel() {
      this.isReloadingOBJ = true;
      this.isModelLoaded = false;
      this.model.isObjGenerated = false;
      this.model.shouldStartObjGeneration = true;

      this.sharedModel.model.isObjGenerated = this.model.isObjGenerated;
      this.sharedModel.model.shouldStartObjGeneration = this.model.shouldStartObjGeneration;
      this.sharedModel.model.attributes = this.model.attributes;

      this.sharedModel = await this.sharedModel.save();
    }
  },
  watch: {
    async 'model.isObjGenerated'(v) {
      console.log('model generated: ', v);
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
