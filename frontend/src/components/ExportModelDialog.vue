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

const { Model, SharedModel } = models.api;

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
    if (this.model) {
      this.formats = ['Default model', 'FCStd', 'STEP', 'STL', 'OBJ'];
      this.reason = "This is your model, so all formats are available for download.";
      return;
    }
    if (this.sharedModel) {
      this.formats = [];
      if (this.sharedModel.canDownloadDefaultModel && (this.user && this.user.constraint.canDownloadOriginal)) {
        this.formats.push('Default model');
      }
      if (this.sharedModel.canExportFCStd && (this.user && this.user.constraint.canExportModel)) {
        this.formats.push('FCStd');
      }
      if (this.sharedModel.canExportSTEP && (this.user && this.user.constraint.canExportModel)) {
        this.formats.push('STEP');
      }
      if (this.sharedModel.canExportSTL && (this.user && this.user.constraint.canExportModel)) {
        this.formats.push('STL');
      }
      if (this.sharedModel.canExportOBJ && (this.user && this.user.constraint.canExportModel)) {
        this.formats.push('OBJ');
      }
    }
    if (this.user && this.user.constraint.canExportModel) {
      this.reason = 'Your account level allows exports of all types.';
    } else if (this.user && this.user.constraint.canDownloadOriginal && this.formats.length===1 && this.formats[0] == 'Default model') {
      this.reason = `Your account level (${this.user.tier}) can download the original default file.`;
    } else if (this.user && this.user.constraint.canDownloadOriginal && this.user.constraint.canExportModel && this.formats.length > 0) {
      this.reason = `The owner of this model has given permission to download multiple formats. (${this.formats})`;
    } else if (this.user && this.user.constraint.canDownloadOriginal) {
      this.reason = 'Your account can normally download the original, but the owner of this model has this blocked.';
    } else if (this.user && !this.user.constraint.canDownloadOriginal) {
      this.reason = 'Your account needs to be verified before downloads work.';
    } else {
      this.reason = 'You must be logged in to download.';
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
