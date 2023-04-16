<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Share Model</div>
      </template>
      <v-progress-linear
        :active="isCreatePending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <div class="text-subtitle-2">Select permissions user can perform</div>
        <v-checkbox v-model="permissions.canViewModel" readonly hide-details>
          <template v-slot:label>
            Can view model
          </template>
        </v-checkbox>
        <v-checkbox v-model="permissions.canViewModelAttributes" hide-details>
          <template v-slot:label>
            Can view model attributes
          </template>
        </v-checkbox>
        <v-checkbox v-model="permissions.canUpdateModel" hide-details>
          <template v-slot:label>
            <div>Can update model attributes</div>
          </template>
        </v-checkbox>
        <v-checkbox v-model="permissions.canExportModel" hide-details>
          <template v-slot:label>
            <div>Can export model</div>
          </template>
        </v-checkbox>

        <v-text-field variant="outlined" hide-details readonly :value="sharedModelUrl" :disabled="!sharedModelUrl">
          <template v-slot:append>
            <v-btn icon flat @click="copyUrlToClipboard">
              <v-icon>
                mdi-clipboard
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
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="generateSharedModelUrl" :disabled="isCreatePending">Generate Link</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

const { SharedModel } = models.api;

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
    permissions: {
      canViewModel: true,
      canViewModelAttributes: false,
      canUpdateModel: false,
      canExportModel: false
    },
    sharedModel: null,
    toolTipMsg: 'Copy to clipboard'
  }),
  computed: {
    ...mapState('shared-models', ['isCreatePending']),
    sharedModelUrl: (vm) => {
      if (vm.sharedModel) {
        return window.location.origin + '/share/' + vm.sharedModel._id
      }
      return ''
    }
  },
  methods: {
    async generateSharedModelUrl() {
      const sharedModel = new SharedModel();
      sharedModel.canViewModel = this.permissions.canViewModel;
      sharedModel.canViewModelAttributes = this.permissions.canViewModelAttributes;
      sharedModel.canUpdateModel = this.permissions.canUpdateModel;
      sharedModel.canExportModel = this.permissions.canExportModel;
      sharedModel.cloneModelId = this.modelId;
      this.sharedModel = await sharedModel.create();
    },
    async copyUrlToClipboard() {
      await navigator.clipboard.writeText(this.sharedModelUrl);
      this.toolTipMsg = 'Link copied!';
      setTimeout(() => {this.toolTipMsg = 'Copy to clipboard'}, 5000);
    },
  }
}
</script>

<style scoped>

</style>
