<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="36em"
  >
    <v-card>
      <v-card-title>
        <v-progress-linear
          :active="isPatchPending"
          indeterminate
          absolute
          bottom
        ></v-progress-linear>
        <div class="text-center">Change Visibility</div>
      </v-card-title>
      <v-card-text>
        <v-form>
          <span>Should Workspace Be Seen By The General Public</span>
          <v-radio-group
            v-model="newOpenSelect"
            :disabled="isPatchPending"
          >
            <v-radio label="Visible to Public (public = true)" value="true"></v-radio>
            <v-radio label="Not Visible (public = false)" value="false"></v-radio>
          </v-radio-group>
        </v-form>
        <v-snackbar
          :timeout="2000"
          v-model="showSnacker"
        >
          {{ snackerMsg }}
        </v-snackbar>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="doOpenSelectChange()"
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
  name: 'workspaceOpenSelectDialog',
  props: {
    workspace: {}
  },
  created() {
  },
  data: () => ({
    dialog: false,
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
    snackerMsg: '',
    showSnacker: false,
    newOpenSelect: "false",
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async doOpenSelectChange() {
      await Workspace.patch(
        this.workspace._id,
        {
          open: this.newOpenSelect === "true",
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
