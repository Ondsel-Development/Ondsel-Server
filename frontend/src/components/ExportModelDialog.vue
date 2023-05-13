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
        <v-row>
          <v-select
            ref="inputFormatField"
            v-model="format"
            :items="formats"
            :disabled="isExportInProgress"
            required
            density="comfortable"
            label="Select file format"
          ></v-select>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false; isExportInProgress = false">Cancel</v-btn>
        <v-btn color="primary" @click="runExportCmd" :disabled="!format || isExportInProgress">Download</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Model, SharedModel } = models.api;

const uploadEndpoint = `${import.meta.env.VITE_APP_API_URL}upload`

export default {
  name: 'ExportModelDialog',
  emits: ['exportModel'],
  props: {
    isActive: Boolean,
    model: Object,
    sharedModel: Object
  },
  data: () => ({
    dialog: false,
    valid: false,
    format: null,
    isExportInProgress: false,
  }),
  computed: {
    ...mapState('auth', ['accessToken']),
    mainModel: (vm) => {
      if (vm.sharedModel) {
        return vm.sharedModel.model;
      }
      return vm.model;
    },
    formats: (vm) => {
      if (vm.model) {
        return ['FCStd', 'STEP', 'STL', 'OBJ']
      }
      const outputFormats = []
      if (vm.sharedModel) {
        if (vm.sharedModel.canExportFCStd) {
          outputFormats.push('FCStd');
        }
        if (vm.sharedModel.canExportSTEP) {
          outputFormats.push('STEP');
        }
        if (vm.sharedModel.canExportSTL) {
          outputFormats.push('STL');
        }
        if (vm.sharedModel.canExportOBJ) {
          outputFormats.push('OBJ');
        }
      }
      return outputFormats;
    },

  },
  methods: {
    async runExportCmd() {
      if (!this.format) {
        return
      }
      this.isExportInProgress = true;
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
      const fileEndpoint = `${uploadEndpoint}/${model._id}_export.${this.format}`;

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
          const fileName = `${model.custFileName.replace(/\.[^/.]+$/, '')}-export.${this.format}`
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
