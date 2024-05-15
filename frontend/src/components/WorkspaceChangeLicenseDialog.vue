<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Change Sharing License</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="workspaceNameDescDialogForm" @submit.prevent="isPatchPending">
        <v-card-text>
          <v-radio-group
            label="License terms if shared with the general public"
            v-model="newLicense"
            :disabled="isPatchPending"
          >
            <v-radio label="none assigned (contact copyright holder for details)" value="null"></v-radio>
            <v-radio label="Creative Commons CC0 1.0 Universal (public domain dedication)" value="CC0 1.0"></v-radio>
            <v-radio label="Creative Commons Attribution 4.0 International" value="CC BY 4.0"></v-radio>
            <v-radio label="Creative Commons Attribution-ShareAlike 4.0 International" value="CC BY-SA 4.0"></v-radio>
            <v-radio label="All Rights Reserved" value="All Rights Reserved"></v-radio>
          </v-radio-group>
          <v-card-text>
            <ul>
              <li><a href="https://creativecommons.org/">Link for more information about Creative Commons licenses.</a></li>
              <li>"All Rights Reserved" is not a license per se but simply an indicator you are using Ondsel for Public and/or Private Display of design and data, but are not assigning away any specific rights.</li>
            </ul>
          </v-card-text>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="doLicenseChange()"
          color="primary"
          variant="elevated"
          :disabled="isPatchPending"
        >Change</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Workspace } = models.api;

export default {
  name: 'workspaceChangeLicenseDialog',
  props: {
    workspace: {}
  },
  created() {
  },
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    newLicense: null,
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async doLicenseChange() {
      if (this.newLicense === "null") {
        this.newLicense = null;
      }
      await Workspace.patch(
        this.workspace._id,
        {
          license: this.newLicense,
        }
      ).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
    }
  },
}
</script>

<style scoped>
</style>
