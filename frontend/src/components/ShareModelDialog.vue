<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="820">
      <template v-slot:title>
        <div class="text-center">Share Model</div>
      </template>
      <v-progress-linear
        :active="isGeneratingLink"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-item>
        <v-alert
          variant="outlined"
          type="error"
          border="top"
          class="text-left"
          v-if="error === 'UpgradeTier'"
        >
          <span>Please upgrade your tier.</span>
        </v-alert>
      </v-card-item>
      <v-form ref="form" @submit.prevent="generateSharedModelUrl">
        <v-card-text>
          <v-text-field
            v-model.trim="description"
            label="Description"
            hint="Enter description of share link, it can be tag or short note"
            :disabled="isGeneratingLink"
            :counter="20"
            :rules="descriptionRules"
          ></v-text-field>
          <v-combobox
            v-model="protection"
            label="Protection"
            :items="['Listed', 'Unlisted']"
          ></v-combobox>
          <div class="text-subtitle-2">Select permissions user can perform</div>
          <v-checkbox v-model="permissions.canViewModel" :disabled="isGeneratingLink" readonly hide-details>
            <template v-slot:label>
              Can view model
            </template>
          </v-checkbox>
          <v-checkbox v-model="permissions.canViewModelAttributes" :disabled="isGeneratingLink" hide-details>
            <template v-slot:label>
              Can view model attributes
            </template>
          </v-checkbox>
          <v-checkbox v-model="permissions.canUpdateModel" :disabled="isGeneratingLink" hide-details>
            <template v-slot:label>
              <div>Can update model attributes</div>
            </template>
          </v-checkbox>
          <div class="ml-2 mt-2 text-body-2">Export model permissions</div>
          <v-container>
            <v-row no-gutters>
              <v-col cols="6">
                <v-checkbox v-model="permissions.canDownloadDefaultModel" :disabled="isGeneratingLink" hide-details>
                  <template v-slot:label>
                    <div>Can download original model</div>
                  </template>
                </v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-model="permissions.canExportFCStd" :disabled="isGeneratingLink" hide-details>
                  <template v-slot:label>
                    <div>Can export FCStd</div>
                  </template>
                </v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-model="permissions.canExportSTEP" :disabled="isGeneratingLink" hide-details>
                  <template v-slot:label>
                    <div>Can export STEP</div>
                  </template>
                </v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-model="permissions.canExportSTL" :disabled="isGeneratingLink" hide-details>
                  <template v-slot:label>
                    <div>Can export STL</div>
                  </template>
                </v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-model="permissions.canExportOBJ" :disabled="isGeneratingLink" hide-details>
                  <template v-slot:label>
                    <div>Can export OBJ
                    </div>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>
          </v-container>

          <v-text-field ref="sharedUrl" variant="outlined" hide-details readonly :value="sharedModelUrl" :disabled="!sharedModelUrl">
            <template v-slot:append>
              <v-btn
                color="decoration"
                icon
                flat
                @click="copyUrlToClipboard"
              >
                <v-icon>
                  mdi-content-copy
                </v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                >{{ toolTipMsg }}</v-tooltip>
              </v-btn>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            @click="dialog = false"
          >Stop Making Links</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            :disabled="isGeneratingLink"
          >Generate Link</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { models } from '@feathersjs/vuex';

const { Model, SharedModel } = models.api;

export default {
  name: 'ShareModelDialog',
  emits: ['shareModel'],
  props: {
    isActive: Boolean,
    modelId: String,
  },
  data: () => ({
    dialog: false,
    valid: false,
    description: '',
    protection: 'Unlisted',
    permissions: {
      canViewModel: true,
      canViewModelAttributes: false,
      canUpdateModel: false,
      canExportFCStd: false,
      canExportSTEP: false,
      canExportSTL: false,
      canExportOBJ: false,
      canDownloadDefaultModel: false,
    },
    tmpSharedModel: null,
    tmpModel: null,
    sharedModel: null,
    isGeneratingLink: false,
    toolTipMsg: 'Copy to clipboard',
    descriptionRules: [
      v => !!v || 'Description is required',
      v => (v && v.length <= 20) || 'Description must be less than 20 characters'
    ],
    error: ''
  }),
  computed: {
    sharedModelUrl: (vm) => {
      if (vm.sharedModel) {
        return window.location.origin + '/share/' + vm.sharedModel._id
      }
      return ''
    }
  },
  methods: {
    async generateSharedModelUrl() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.isGeneratingLink = true;
      this.sharedModel = null;
      const sharedModel = new SharedModel();
      sharedModel.protection = this.protection;
      sharedModel.description = this.description;
      sharedModel.canViewModel = this.permissions.canViewModel;
      sharedModel.canViewModelAttributes = this.permissions.canViewModelAttributes;
      sharedModel.canUpdateModel = this.permissions.canUpdateModel;
      sharedModel.canExportFCStd = this.permissions.canExportFCStd;
      sharedModel.canExportSTEP = this.permissions.canExportSTEP;
      sharedModel.canExportSTL = this.permissions.canExportSTL;
      sharedModel.canExportOBJ = this.permissions.canExportOBJ;
      sharedModel.canDownloadDefaultModel = this.permissions.canDownloadDefaultModel;
      sharedModel.cloneModelId = this.modelId;
      try {
        this.tmpSharedModel = await sharedModel.create();
        this.tmpModel = await Model.get(this.tmpSharedModel.model._id, { query: { isSharedModel: true }});
      } catch (e) {
        this.error = 'UpgradeTier';
        this.isGeneratingLink = false;
      }
    },

    async copyToClipboard(textToCopy) {
      this.$refs.sharedUrl.select();
      // Navigator clipboard api needs a secure context (https)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        }
      }
    },

    async copyUrlToClipboard() {
      await this.copyToClipboard(this.sharedModelUrl);
      this.toolTipMsg = 'Link copied!';
      setTimeout(() => {this.toolTipMsg = 'Copy to clipboard'}, 5000);
    },
  },
  watch: {
    'tmpModel.isObjGenerated'(v) {
      if (v) {
        this.sharedModel = this.tmpSharedModel;
        this.tmpSharedModel = null;
        this.tmpModel = null;
        this.isGeneratingLink = false;
      }
    }
  }
}
</script>

<style scoped>

</style>
