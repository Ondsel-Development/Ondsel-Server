<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Export Model</div>
      </template>
      <v-progress-linear
        :active="isExportInProgress"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <p>{{reason}}</p>
        <br>
          <v-select
            ref="inputFormatField"
            v-model="format"
            :items="formats"
            :disabled="isExportInProgress"
            required
            density="comfortable"
            label="Select file format"
          ></v-select>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false; isExportInProgress = false">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="runExportCmd"
          :disabled="!format || isExportInProgress || (!isAuthenticated && !(format === 'Default model')) || (user && !user.constraint.canExportModel && !(format === 'Default model'))"
        >Download</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import { models } from '@feathersjs/vuex';
import { mapState, mapGetters } from 'vuex';
import {SubscriptionTypeMap} from "@/store/services/users";

const { SharedModel } = models.api;

const uploadEndpoint = `${import.meta.env.VITE_APP_API_URL}upload`

export default {
  name: 'ExportModelDialog',
  emits: ['exportModel'],
  props: {
    isActive: Boolean,
    model: Object,
    sharedModel: Object,
    sharedModelSubModel: Object  // refs: sharedModel.model
  },
  data: () => ({
    dialog: false,
    valid: false,
    format: null,
    isExportInProgress: false,
    formats: [],
    reason: '',
  }),
  async created() {
    if (this.user && (this.mainModel.userId === this.user._id)) {
      let exportsForOthers = [];
      if (this.sharedModel) {
        let modelPerms = this.sharedModel;
        if (modelPerms.canExportFCStd) {
          exportsForOthers.push('FCStd');
        }
        if (modelPerms.canExportSTEP) {
          exportsForOthers.push('STEP');
        }
        if (modelPerms.canExportSTL) {
          exportsForOthers.push('STL');
        }
        if (modelPerms.canExportOBJ) {
          exportsForOthers.push('OBJ');
        }
      }
      if (this.user.constraint.canExportModel) {
        this.formats = ['Default model', 'FCStd', 'STEP', 'STL', 'OBJ'];
        this.reason = "This is your model, so you can download the original or export other formats. ";
      } else {
        this.formats = ['Default model'];
        this.reason = "This is your model. ";
      }
      if (this.sharedModel) {
        if (this.sharedModel.canDownloadDefaultModel) {
          this.reason += `${SubscriptionTypeMap.solo} users will be able to download the original. `;
        }
        if (exportsForOthers.length > 0) {
          this.reason += `${SubscriptionTypeMap.peer} and ${SubscriptionTypeMap.enterprise} users will also be able to export [${exportsForOthers}]`;
        }
      }
      return;
    }
    this.formats = [];
    let shareAllowsDownload = false;
    let shareAllowsOriginalDownload = false;
    let shareAllows_ONLY_OriginalDownload = false;
    const userAllowedOriginalDownload = this.user && this.user.constraint.canDownloadOriginal;
    const userAllowedExportDownload = this.user && this.user.constraint.canExportModel;
    if (this.sharedModel.canDownloadDefaultModel) {
      shareAllowsDownload = true;
      shareAllowsOriginalDownload = true;
      shareAllows_ONLY_OriginalDownload = true; // might be set back to false below
      if (userAllowedOriginalDownload) {
        this.formats.push('Default model');
      }
    }
    if (this.sharedModel.canExportFCStd) {
      shareAllowsDownload = true;
      shareAllows_ONLY_OriginalDownload = false;
      if (userAllowedExportDownload)
      {
        this.formats.push('FCStd');
      }
    }
    if (this.sharedModel.canExportSTEP) {
      shareAllowsDownload = true;
      shareAllows_ONLY_OriginalDownload = false;
      if (userAllowedExportDownload) {
        this.formats.push('STEP');
      }
    }
    if (this.sharedModel.canExportSTL) {
      shareAllowsDownload = true;
      shareAllows_ONLY_OriginalDownload = false;
      if  (userAllowedExportDownload) {
        this.formats.push('STL');
      }
    }
    if (this.sharedModel.canExportOBJ) {
      shareAllowsDownload = true;
      if (userAllowedExportDownload) {
        this.formats.push('OBJ');
      }
    }
    if (shareAllowsDownload) {
      if (shareAllows_ONLY_OriginalDownload) {
        if (userAllowedOriginalDownload) {
          this.reason = `Your account level (${this.user.tier}) allows downloading the original model file.`;
        } else {
          this.reason = 'Your cannot download the original model file. Please login with a verified account.';
        }
      } else {
        if (userAllowedOriginalDownload && !userAllowedExportDownload && shareAllowsOriginalDownload) {
          this.reason = 'Your account allows the download of the original model file (but nothing more).';
        } else {
          this.reason = `The owner of this model has given permission to download the following formats. [${this.formats}]`;
        }
      }
    } else {
      this.reason = `The owner of this model does not allow downloads with this shared link.`
    }
  },
  computed: {
    ...mapState('auth', ['accessToken', 'user']),
    ...mapGetters('auth', ['isAuthenticated']),
    mainModel: (vm) => {
      if (vm.sharedModel) {
        return vm.sharedModelSubModel;
      }
      return vm.model;
    },
  },
  methods: {
    async runExportCmd() {
      if (!this.format) {
        return
      }
      this.isExportInProgress = true;
      if (this.format === 'Default model') {
        await this.downloadFile(this.model || this.sharedModel.model);
        return;
      }
      const data = {
        shouldStartFCStdExport: this.format === 'FCStd',
        shouldStartSTEPExport: this.format === 'STEP',
        shouldStartSTLExport: this.format === 'STL',
        shouldStartOBJExport: this.format === 'OBJ',
      };
      if (this.model) {
        await this.model.patch({data: data});
      }
      if (this.sharedModel) {
        await this.sharedModel.patch({'data': {'model': data}})

        if (!this.accessToken) {
          let callCounts = 0;
          const intervalId = setInterval(
            async () => {
              const sharedModel = await SharedModel.get(this.sharedModel._id);
              if (this.format === 'FCStd' && sharedModel.model.isExportFCStdGenerated) {
                clearInterval(intervalId);
              } else if (this.format === 'STEP' && sharedModel.model.isExportSTEPGenerated) {
                clearInterval(intervalId);
              } else if (this.format === 'STL' && sharedModel.model.isExportSTLGenerated) {
                clearInterval(intervalId);
              } else if (this.format === 'OBJ' && sharedModel.model.isExportOBJGenerated) {
                clearInterval(intervalId);
              }
              callCounts += 1;
              if (callCounts >= 2) {
                clearInterval(intervalId);
              }
            }, 3000
          )
        }
      }
    },
    async downloadFile(model) {

      let fileEndpoint;
      let fileName;
      const custFileName = model.custFileName || model.file.custFileName;
      if (this.format === 'Default model') {
        fileEndpoint = `${uploadEndpoint}/${model.uniqueFileName}`;
        fileName = custFileName;
      } else {
        fileEndpoint = `${uploadEndpoint}/${model._id}_export.${this.format}`;
        fileName = `${custFileName.replace(/\.[^/.]+$/, '')}-export.${this.format}`;
      }

      await axios(
        {
          method: 'GET',
          url: fileEndpoint,
          params: this.sharedModel ? { modelId: model._id.toString()} : {},
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      ).then(async (res) => {
        await axios(
          {
            url: res.data.url,
            method: 'GET',
            responseType: 'blob',
          }).then((res) => {
          const file = window.URL.createObjectURL(new Blob([res.data]));
          const docUrl = document.createElement('a');
          docUrl.href = file;
          docUrl.setAttribute('download', fileName);
          document.body.appendChild(docUrl);
          docUrl.click();
          this.isExportInProgress = false;
        });
      });
    },
  },
  watch: {

    async 'mainModel.isExportSTLGenerated'(v) {
      if (v) {
        await this.downloadFile(this.mainModel);
      }
    },

    async 'mainModel.isExportFCStdGenerated'(v) {
      if (v) {
        await this.downloadFile(this.mainModel);
      }
    },

    async 'mainModel.isExportSTEPGenerated'(v) {
      if (v) {
        await this.downloadFile(this.mainModel);
      }
    },

    async 'mainModel.isExportOBJGenerated'(v) {
      if (v) {
        await this.downloadFile(this.mainModel);
      }
    },
  }
}
</script>

<style scoped>

</style>
