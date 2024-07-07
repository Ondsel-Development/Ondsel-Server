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
      <v-card-item v-if="genericError">
        <v-alert
          variant="outlined"
          type="error"
          border="top"
          class="text-left"
          v-if="genericError"
        >
          <span>{{genericError}}</span>
        </v-alert>
      </v-card-item>
      <v-card-text>
        <v-form ref="form">
          <v-sheet v-if="!creatorRole" class="mt-nr">
            <v-switch
              :class="isActive ? 'text-green-darken-3' : 'text-red-darken-3'"
              v-model="isActive"
              :disabled="isGeneratingLink"
              hide-details
              :label = "isActive ? 'Enabled' : 'Disabled'"
            ></v-switch>
          </v-sheet>
          <v-text-field
            v-model.trim="title"
            label="Title"
            hint="Enter a title to guide the viewer"
            density="compact"
            :disabled="isGeneratingLink"
            :counter="120"
            :rules="titleRules"
          ></v-text-field>
          <v-text-field
            class="mt-n2"
            v-model.trim="privateDescription"
            label="Private Note (not seen by public)"
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
            v-if="protection === 'Pin' || protection.value === 'Pin'"
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
            v-if="!versionFollowingPreset"
            v-model="versionFollowing"
            label="Version Change Handling"
            :items="versionFollowingItems"
            hide-details
            density="compact"
            :readonly="versionFollowingPreset"
            class="mt-4 mb-6"
          ></v-combobox>
          <v-sheet
            v-if="versionFollowingPreset"
            class="mt-4 mb-6 pl-4 border-sm"
            id="SLCD-version-follow-text"
          >
            <span class="text-sm-caption">Version Change Handling</span>
            <br>
            {{versionFollowing}} : {{ versionFollowing==='Locked' ? 'only show this version of file' : 'show the active version of file'}}
          </v-sheet>
          <v-tooltip v-if=versionFollowingPreset activator="#SLCD-version-follow-text">
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
            v-if="!creatorRole"
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
                @click="updateSharedModel()"
              >Update</v-btn>
            </v-sheet>
            <v-btn
              v-if="!creatorRole"
              color="error"
              class="dialogButtons align-self-end"
              :disabled="isGeneratingLink"
              @click="startVerifyDeleteDialog()"
            >Delete</v-btn>
          </v-sheet>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
  <verify-delete-dialog @delete-approved="deleteSharedLink" ref="verifyDeleteRef"></verify-delete-dialog>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {cleanupString} from "@/genericHelpers";
import _ from "lodash";
import VerifyDeleteDialog from "@/components/VerifyDeleteDialog.vue";
import verifyDeleteDialog from "@/components/VerifyDeleteDialog.vue";

const { Model, SharedModel } = models.api;

export default {
  name: 'ShareLinkCrudDialog',
  components: {VerifyDeleteDialog},
  emits: ['sharedModelChanged'],
  props: {},
  data: () => ({
    dialog: false,
    sharedModel: null,
    sharedModelId: null,
    modelId: null,
    creatorRole: false,
    valid: false,
    privateDescription: '',
    title: '',
    defaultTitle: 'SharedModel',
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
    titleRules: [
      v => !!v || 'Content required',
      v => (v && v.length <= 120) || 'Must be less than 120 characters'
    ],
    descriptionRules: [
      v => !!v || 'Content required',
      v => (v && v.length <= 20) || 'Must be less than 20 characters'
    ],
    pinRules: [
      v => !!v || 'PIN is required',
      v => (v && v.length === 6) || 'PIN must be 6 characters'
    ],
    error: '',
    genericError: '',
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
    verifyDeleteDialog() {
      return verifyDeleteDialog
    }
  },
  methods: {
    async cleanCreatorStart() {
      this.sharedModel = null;
      this.tmpSharedModel = null;
      this.genericError = '';
      //
      // this.versionFollowing  // set by caller
      this.isActive = true;
      this.protection = 'Unlisted';
      this.pin = null;
      this.privateDescription = '';
      this.title = this.defaultTitle;
      this.permissions.canViewModel = true;
      this.permissions.canViewModelAttributes = false;
      this.permissions.canUpdateModel = false;
      this.permissions.canExportFCStd = false;
      this.permissions.canExportSTEP = false;
      this.permissions.canExportSTL = false;
      this.permissions.canExportOBJ = false;
      this.permissions.canDownloadDefaultModel = false;
      this.tags = [];
      // this.modelId  // set by caller
      //
      this.assertPermissionConditions();
      this.sharedModelId = null; // not an update
    },
    async assignFromExistingSharedModel(smSummary) {
      this.sharedModelId = null; // paranoia; no updates will happen until this is set
      const sharedModel = await SharedModel.get(smSummary._id);
      this.tmpSharedModel = sharedModel;
      this.genericError = '';
      //
      this.isActive = sharedModel.isActive;
      this.versionFollowing = sharedModel.versionFollowing;
      this.protection = sharedModel.protection;
      this.pin = sharedModel.pin;
      this.privateDescription = sharedModel.description;
      this.title = sharedModel.title;
      this.permissions.canViewModel = sharedModel.canViewModel;
      this.permissions.canViewModelAttributes = sharedModel.canViewModelAttributes;
      this.permissions.canUpdateModel = sharedModel.canUpdateModel;
      this.permissions.canExportFCStd = sharedModel.canExportFCStd;
      this.permissions.canExportSTEP = sharedModel.canExportSTEP;
      this.permissions.canExportSTL = sharedModel.canExportSTL;
      this.permissions.canExportOBJ = sharedModel.canExportOBJ;
      this.permissions.canDownloadDefaultModel = sharedModel.canDownloadDefaultModel;
      this.tags = sharedModel.curation?.tags || [];
      //
      this.assertPermissionConditions();
      this.sharedModel = sharedModel;
      this.modelId = sharedModel.cloneModelId;
      this.sharedModelId = sharedModel._id;
    },
    generateAndValidateChanges() {
      let changes = {};
      // isActive
      if (this.isActive !== this.sharedModel.isActive) {
        changes.isActive = this.isActive;
      }
      // protection
      let desiredProtection = this.protection.value ? this.protection.value : this.protection;
      if (desiredProtection !== this.sharedModel.protection) {
        if (['Listed', 'Unlisted', 'Pin', 'Direct'].includes(desiredProtection)) {
          changes.protection = desiredProtection;
        } else {
          this.genericError = `A protection of ${desiredProtection} is not known.`;
          return false;
        }
      }
      // pin
      if (this.pin !== this.sharedModel.pin) {
        if (desiredProtection === 'Pin') {
          if (this.pin?.length !== 6) {
            this.genericError = 'PIN must be 6 digits';
            return false;
          }
          changes.pin = this.pin;
        } else {
          changes.pin = '';
        }
      }
      // title
      if (this.title !== this.sharedModel.title) {
        let desiredTitle = cleanupString(this.title, 120);
        if (desiredTitle.length === 0) {
          this.genericError = 'Must have a title';
          return false;
        }
        changes.title = desiredTitle;
      }
      // description
      if (this.privateDescription !== this.sharedModel.description) {
        let desiredDescription = cleanupString(this.privateDescription, 20);
        if (desiredDescription.length === 0) {
          this.genericError = 'Must have a private note';
          return false;
        }
        changes.description = desiredDescription;
      }
      // // canViewModel
      // if (this.permissions.canViewModel !== this.sharedModel.canViewModel) {
      //   changes.canViewModel = this.permissions.canViewModel;
      // }
      // canViewModelAttributes
      if (this.permissions.canViewModelAttributes !== this.sharedModel.canViewModelAttributes) {
        changes.canViewModelAttributes = this.permissions.canViewModelAttributes;
      }
      // canUpdateModel
      if (this.permissions.canUpdateModel !== this.sharedModel.canUpdateModel) {
        changes.canUpdateModel = this.permissions.canUpdateModel;
      }
      // canExportFCStd
      if (this.permissions.canExportFCStd !== this.sharedModel.canExportFCStd) {
        changes.canExportFCStd = this.permissions.canExportFCStd;
      }
      // canExportSTEP
      if (this.permissions.canExportSTEP !== this.sharedModel.canExportSTEP) {
        changes.canExportSTEP = this.permissions.canExportSTEP;
      }
      // canExportSTL
      if (this.permissions.canExportSTL !== this.sharedModel.canExportSTL) {
        changes.canExportSTL = this.permissions.canExportSTL;
      }
      // canExportOBJ
      if (this.permissions.canExportOBJ !== this.sharedModel.canExportOBJ) {
        changes.canExportOBJ = this.permissions.canExportOBJ;
      }
      // canDownloadDefaultModel
      if (this.permissions.canDownloadDefaultModel !== this.sharedModel.canDownloadDefaultModel) {
        changes.canDownloadDefaultModel = this.permissions.canDownloadDefaultModel;
      }
      // tags
      if (!_.isEqual(this.tags, this.sharedModel.curation.tags)) {
        this.sharedModel.curation.tags = _.cloneDeep(this.tags);
        changes.curation = this.sharedModel.curation;
      }
      return changes;
    },
    async updateSharedModel() {
      if (this.sharedModelId) {
        const changes = this.generateAndValidateChanges();
        if (changes) {
          await SharedModel.patch(
            this.sharedModelId,
            changes
          );
          this.$emit('sharedModelChanged');
          this.dialog = false;
        }
      }
    },
    async generateSharedModelUrl() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      let desiredProtection = this.protection.value ? this.protection.value : this.protection;
      if (desiredProtection === 'Pin' && this.pin?.length !== 6) {
        this.genericError = 'PIN must be 6 digits';
        return;
      }
      this.genericError = null;
      this.isGeneratingLink = true;
      this.sharedModel = null;
      const sharedModel = new SharedModel();

      // isActive is not set on creation
      // versionFollowing
      let desiredVF = this.versionFollowing.value ? this.versionFollowing.value : this.versionFollowing;
      sharedModel.versionFollowing = desiredVF;
      // protection
      sharedModel.protection = desiredProtection;
      // pin
      sharedModel.pin = this.pin;
      // title
      sharedModel.title = cleanupString(this.title, 120);
      // description
      sharedModel.description = cleanupString(this.privateDescription, 20);
      // canViewModel -- should be hard-code to `true` for now
      sharedModel.canViewModel = this.permissions.canViewModel;
      // canViewModelAttributes
      sharedModel.canViewModelAttributes = this.permissions.canViewModelAttributes;
      // canUpdateModel
      sharedModel.canUpdateModel = this.permissions.canUpdateModel;
      // canExportFCStd
      sharedModel.canExportFCStd = this.permissions.canExportFCStd;
      // canExportSTEP
      sharedModel.canExportSTEP = this.permissions.canExportSTEP;
      // canExportSTL
      sharedModel.canExportSTL = this.permissions.canExportSTL;
      // canExportOBJ
      sharedModel.canExportOBJ = this.permissions.canExportOBJ;
      // canDownloadDefaultModel
      sharedModel.canDownloadDefaultModel = this.permissions.canDownloadDefaultModel;
      // tags are not created at first
      sharedModel.cloneModelId = this.modelId;
      try {
        this.tmpSharedModel = await sharedModel.create();
        if (sharedModel.versionFollowing === 'Active') {
          this.tmpModel = await Model.get(this.tmpSharedModel.cloneModelId);
        } else {
          this.tmpModel = await Model.get(this.tmpSharedModel.model._id, { query: { isSharedModel: true }});
        }
      } catch (e) {
        console.log(e);
        this.genericError = 'Please upgrade your tier';
        this.isGeneratingLink = false;
      }
    },
    async startVerifyDeleteDialog() {
      this.isGeneratingLink = true;
      this.$refs.verifyDeleteRef.$data.targetName = `Shared Link "${this.sharedModel.title}"`;
      this.$refs.verifyDeleteRef.$data.warnings = [
        'The link cannot be "undeleted"',
        'Anyone who knows the link will get a "404 not found" if they visit the old link',
      ];
      this.$refs.verifyDeleteRef.$data.dialog = true;
    },
    async deleteSharedLink() {
      this.isGeneratingLink = true;
      await SharedModel.remove(this.sharedModelId);
      this.isGeneratingLink = false;
      this.$emit('sharedModelChanged');
      this.dialog = false;
    },
    assertPermissionConditions() {
      let desiredVF = this.versionFollowing.value ? this.versionFollowing.value : this.versionFollowing;
      if (desiredVF) {
        if (desiredVF === 'Locked') {
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
    },
  },
  watch: {
    'tmpModel.isObjGenerated'(v) {
      if (v) {
        this.sharedModel = this.tmpSharedModel;
        this.tmpSharedModel = null;
        this.tmpModel = null;
        this.isGeneratingLink = false;
        this.$emit('sharedModelChanged');
        this.dialog=false;
      }
    },
    'versionFollowing'() {
      this.assertPermissionConditions()
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
