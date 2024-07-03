<template>
  <v-dialog
    v-model="dialog"
    width="32em"
    persistent
  >
    <v-card>
      <v-card-title>
        {{creatorRole ? 'Create' : 'Update'}} Shared Link
      </v-card-title>
      <v-card-subtitle v-if="versionDescription">{{versionDescription}}</v-card-subtitle>
      <v-progress-linear
        :active="isGeneratingLink"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-item v-if="error">
        <v-alert
          variant="outlined"
          type="error"
          border="top"
          class="text-left"
          v-if="error === 'UpgradeTier'"
        >
          <span>Please upgrade your tier.</span>
        </v-alert>
        <v-alert
          variant="outlined"
          type="error"
          border="top"
          class="text-left"
          v-if="error === 'PinValidationError'"
        >
          <span>PIN must be 6 characters</span>
        </v-alert>
      </v-card-item>
      <v-card-text>
        <v-form ref="form">
          <v-switch
            class="text-green-darken-3 mt-n4"
            v-model="isActive"
            :disabled="isGeneratingLink"
            hide-details
            label = "Enabled"
          ></v-switch>
          <v-text-field
            v-model.trim="publicDescription"
            label="Description (seen by Viewer)"
            hint="Enter a description share link to guide the viewer"
            density="compact"
            :disabled="isGeneratingLink"
          ></v-text-field>
          <v-text-field
            class="mt-n2"
            v-model.trim="privateDescription"
            label="Private Note"
            hint="Enter a short private note for the share link"
            density="compact"
            :disabled="isGeneratingLink"
            :counter="20"
            :rules="descriptionRules"
          ></v-text-field>
          <v-combobox
            class="mt-n2"
            v-model="protection"
            label="Protection"
            density="compact"
            :items="protectionItems"
            hide-details
          ></v-combobox>
          <div
            v-if="protection === 'Pin'"
            class="d-flex flex-row align-center mb-n4"
          >
            <span class="text-body-1">Set PIN</span>
            <v-otp-input
              v-model="pin"
              type="text"
              class="mb-2"
            ></v-otp-input>
          </div>
          <v-combobox
            id="SLCD-version-follow-combobox"
            v-model="versionFollowing"
            label="Version Change Handling"
            :items="versionFollowingItems"
            hide-details
            density="compact"
            :readonly="versionFollowingPreset"
            class="mt-4 mb-6"
          ></v-combobox>
          <v-tooltip v-if=versionFollowingPreset activator="#SLCD-version-follow-combobox">
            Once a Share Link is created, this cannot be modified.
          </v-tooltip>

          <span class="text-subtitle-2 my-2">Viewer general permissions</span>
          <br>
          <v-checkbox
            class="mt-n4"
            v-model="permissions.canViewModel"
            :disabled="isGeneratingLink"
            readonly
            hide-details
            label = "Can view model"
          >
            <v-tooltip activator="parent">
              Can the viewer see the model at all? You can't currently turn this off.
            </v-tooltip>
          </v-checkbox>
<!--          <v-checkbox-->
<!--            class="mt-n4"-->
<!--            :disabled="isGeneratingLink"-->
<!--            hide-details-->
<!--            label = "Can send to 3rd parties"-->
<!--          >-->
<!--            <v-tooltip activator="parent">-->
<!--              If you allow this, then viewers of the link can get 3rd party quotes and/or prototyping done with your model.-->
<!--            </v-tooltip>-->
<!--          </v-checkbox>-->
          <v-checkbox
            class="mt-n4"
            v-model="permissions.canViewModelAttributes"
            :disabled="isGeneratingLink"
            hide-details
            label = "Can view attributes"
          >
            <v-tooltip activator="parent">
              If you allow this, the viewer can see the parametric parameters of the CAD file.
            </v-tooltip>
          </v-checkbox>
          <v-checkbox
            class="mt-n4"
            v-model="permissions.canUpdateModel"
            :disabled="isGeneratingLink || permissionLocks.canUpdateModel"
            hide-details
            label="Can update attributes"
          >
            <v-tooltip activator="parent">
              If you allow this, the viewer can update parametric parameters of the CAD file and see their own version of the model.
            </v-tooltip>
          </v-checkbox>
          <span class="my-2 text-subtitle-2">Viewer export/download permissions</span>
          <br>
          <v-sheet
            class="d-flex flex-row flex-wrap justify-start"
          >
            <v-checkbox
              class="mt-n4"
              width="9em"
              v-model="permissions.canDownloadDefaultModel"
              :disabled="isGeneratingLink"
              hide-details
              label="original file"
            ></v-checkbox>
            <v-checkbox
              class="mt-n4"
              width="9em"
              v-model="permissions.canExportFCStd"
              :disabled="isGeneratingLink || permissionLocks.canExportFCStd"
              hide-details
              label="as FCStd"
            ></v-checkbox>
            <v-checkbox
              class="mt-n4"
              width="9em"
              v-model="permissions.canExportSTEP"
              :disabled="isGeneratingLink || permissionLocks.canExportSTEP"
              hide-details
              label="as STEP"
            ></v-checkbox>
            <v-checkbox
              class="mt-n4"
              width="9em"
              v-model="permissions.canExportSTL"
              :disabled="isGeneratingLink || permissionLocks.canExportSTL"
              hide-details
              label="as STL"
            ></v-checkbox>
            <v-checkbox
              class="mt-n4"
              width="9em"
              v-model="permissions.canExportOBJ"
              :disabled="isGeneratingLink || permissionLocks.canExportOBJ"
              hide-details
              label="as OBJ"
            ></v-checkbox>
          </v-sheet>
          <v-combobox
            v-model="tags"
            chips
            multiple
            filled
            label="descriptive tags (useful if Listed)"
          >
            <v-chip
              small
              close
            >
              {{ item }}
            </v-chip>
          </v-combobox>
          <v-sheet
            class="d-flex flex-row flex-wrap justify-space-between"
          >
            <v-sheet
              class="d-flex flex-row flex-wrap justify-start"
              width="16em"
            >
              <v-btn
                color="secondary"
                class="dialogButton ml-n1 mr-1 my-1"
                :disabled="isGeneratingLink"
                @click="dialog = false"
              >Cancel</v-btn>
              <v-btn
                v-if="creatorRole"
                color="primary"
                class="dialogButtons my-1"
                :disabled="isGeneratingLink"
                @click="generateSharedModelUrl()"
              >Generate Link</v-btn>
              <v-btn
                v-if="!creatorRole"
                color="primary"
                class="dialogButtons my-1"
                :disabled="isGeneratingLink"
              >Update</v-btn>
            </v-sheet>
            <v-btn
              v-if="!creatorRole"
              color="error"
              class="dialogButtons align-self-end"
              :disabled="isGeneratingLink"
            >Delete</v-btn>
          </v-sheet>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { models } from '@feathersjs/vuex';

const { Model, SharedModel } = models.api;

export default {
  name: 'ShareLinkCrudDialog',
  emits: ['shareModel'],
  props: {},
  data: () => ({
    dialog: false,
    sharedModel: null,
    sharedModelId: null,
    modelId: null,
    creatorRole: false,
    valid: false,
    privateDescription: '',
    publicDescription: '',
    protection: 'Unlisted',
    versionFollowing: 'Locked',
    versionFollowingPreset: false,
    versionDescription: null,
    pin: null,
    isActive: true,
    tags: [],
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
    permissionLocks: {
      canUpdateModel: false,
      canExportFCStd: false,
      canExportSTEP: false,
      canExportSTL: false,
      canExportOBJ: false,
    },
    tmpSharedModel: null,
    tmpModel: null,
    isGeneratingLink: false,
    toolTipMsg: 'Copy to clipboard',
    descriptionRules: [
      v => !!v || 'Content required',
      v => (v && v.length <= 20) || 'Must be less than 20 characters'
    ],
    pinRules: [
      v => !!v || 'PIN is required',
      v => (v && v.length === 6) || 'PIN must be 6 characters'
    ],
    error: '',
    versionFollowingItems: [
      {title: "Share this specific version of the file", value: "Locked"},
      {title: "Always show the file version that is active", value: "Active"},
    ],
    protectionItems: [
      {title: 'Listed: visible & searchable by the public', value: 'Listed'},
      {title: 'Unlisted: visible to public but you need to know the URL', value: 'Unlisted'},
      {title: 'Pin: only visible when the PIN is entered', value: 'Pin'},
      {title: 'Direct: only visible to accounts you add', value: 'Direct'},
    ]
  }),
  computed: {
  },
  methods: {
    async cleanCreatorStart() {
      this.sharedModel = null;
      this.tmpSharedModel = null;
      //
      // this.versionFollowing  // set by caller
      this.protection = 'Unlisted';
      this.pin = null;
      this.privateDescription = '';
      this.publicDescription = '';
      this.permissions.canViewModel = true;
      this.permissions.canViewModelAttributes = false;
      this.permissions.canUpdateModel = false;
      this.permissions.canExportFCStd = false;
      this.permissions.canExportSTEP = false;
      this.permissions.canExportSTL = false;
      this.permissions.canExportOBJ = false;
      this.permissions.canDownloadDefaultModel = false;
      // this.modelId  // set by caller
      //
      this.sharedModelId = null; // not an update
    },
    async assignFromExistingSharedModel(smSummary) {
      this.sharedModelId = null; // paranoia; no updates will happen until this is set
      const sharedModel = await SharedModel.get(smSummary._id);
      this.sharedModel = sharedModel;
      this.tmpSharedModel = sharedModel;
      //
      this.versionFollowing = sharedModel.versionFollowing;
      this.protection = sharedModel.protection;
      this.pin = sharedModel.pin;
      this.privateDescription = sharedModel.description;
      this.publicDescription = ''; // TODO
      this.permissions.canViewModel = sharedModel.canViewModel;
      this.permissions.canViewModelAttributes = sharedModel.canViewModelAttributes;
      this.permissions.canUpdateModel = sharedModel.canUpdateModel;
      this.permissions.canExportFCStd = sharedModel.canExportFCStd;
      this.permissions.canExportSTEP = sharedModel.canExportSTEP;
      this.permissions.canExportSTL = sharedModel.canExportSTL;
      this.permissions.canExportOBJ = sharedModel.canExportOBJ;
      this.permissions.canDownloadDefaultModel = sharedModel.canDownloadDefaultModel;
      this.modelId = sharedModel.cloneModelId;
    },
    async generateSharedModelUrl() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      if (this.protection === 'Pin' && this.pin?.length !== 6) {
        this.error = 'PinValidationError';
        return;
      }
      this.error = null;
      this.isGeneratingLink = true;
      this.sharedModel = null;
      const sharedModel = new SharedModel();
      sharedModel.versionFollowing = this.versionFollowing;
      sharedModel.protection = this.protection;
      sharedModel.pin = this.pin;
      sharedModel.description = this.privateDescription;
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
        if (sharedModel.versionFollowing === 'Active') {
          this.tmpModel = await Model.get(this.tmpSharedModel.cloneModelId);
        } else {
          this.tmpModel = await Model.get(this.tmpSharedModel.model._id, { query: { isSharedModel: true }});
        }
        this.$emit('shareModel');
      } catch (e) {
        this.error = 'UpgradeTier';
        this.isGeneratingLink = false;
      }
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
    },
    'versionFollowing'(v) {
      if (v) {
        if (v === 'Locked') {
          this.permissionLocks.canExportFCStd = false;
          this.permissionLocks.canExportSTEP = false;
          this.permissionLocks.canExportSTL = false;
          this.permissionLocks.canExportOBJ = false;
          this.permissionLocks.canUpdateModel = false;
        } else {
          this.permissionLocks.canExportFCStd = true;
          this.permissionLocks.canExportSTEP = true;
          this.permissionLocks.canExportSTL = true;
          this.permissionLocks.canExportOBJ = true;
          this.permissionLocks.canUpdateModel = true;
          this.permissions.canExportFCStd = false;
          this.permissions.canExportSTEP = false;
          this.permissions.canExportSTL = false;
          this.permissions.canExportOBJ = false;
          this.permissions.canUpdateModel = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.dialogButtons {
  padding-left: 12px;
  padding-right: 12px;
}
</style>
