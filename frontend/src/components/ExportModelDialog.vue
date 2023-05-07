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
  },
  data: () => ({
    dialog: false,
    valid: false,
    format: null,
    formats: [
      'FCStd', 'STEP', 'STL', 'OBJ'
    ],
    isExportInProgress: false
  }),
  computed: {
    ...mapState('auth', ['accessToken']),
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
      await this.model.patch({data: data});
    },
    async downloadFile() {
      const fileEndpoint = `${uploadEndpoint}/${this.model._id}_export.${this.format}`;
      await axios(
        {
          method: 'GET',
          url: fileEndpoint,
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
          const fileName = `${this.model.custFileName.replace(/\.[^/.]+$/, '')}-export.${this.format}`
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

    async 'model.isExportSTLGenerated'(v) {
      if (v) {
        await this.downloadFile();
      }
    },

    async 'model.isExportFCStdGenerated'(v) {
      if (v) {
        await this.downloadFile();
      }
    },

    async 'model.isExportSTEPGenerated'(v) {
      if (v) {
        await this.downloadFile();
      }
    },

    async 'model.isExportOBJGenerated'(v) {
      if (v) {
        await this.downloadFile();
      }
    },
  }
}
</script>

<style scoped>

</style>
