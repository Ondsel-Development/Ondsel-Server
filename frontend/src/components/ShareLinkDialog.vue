<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Share Model</div>
      </template>
      <v-card-text>
        <v-card-title>Direct link</v-card-title>
        <v-text-field
          v-model="sharedModelUrl"
          ref="sharedModelUrl"
          readonly
        >
          <template v-slot:append>
            <v-btn icon color="decoration" flat @click="copyUrlToClipboard('sharedModelUrl')">
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
        <v-divider class="mx-4 mb-1"></v-divider>
        <div v-if="sharedModel.protection === 'Pin'">
          <v-card-title>Direct link with PIN</v-card-title>
          <v-text-field
            v-model="sharedModelUrlWithPin"
            ref="sharedModelUrlWithPin"
            readonly
          >
            <template v-slot:append>
              <v-btn icon color="decoration" flat @click="copyUrlToClipboard('sharedModelUrlWithPin')">
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
          <v-divider class="mx-4 mb-1"></v-divider>
        </div>
        <v-card-title>Share in FreeCAD Forum</v-card-title>
        <v-text-field
          v-model="freecadForumUrl"
          ref="freecadForumUrl"
          readonly
        >
          <template v-slot:append>
            <v-btn icon color="decoration" flat @click="copyUrlToClipboard('freecadForumUrl')">
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

        <v-divider class="mx-4 mb-1"></v-divider>
        <v-card-title>Embed</v-card-title>
        <v-text-field
          v-model="iFrameUrl"
          ref="iFrameUrl"
          readonly
        >
          <template v-slot:append>
            <v-btn icon color="decoration" flat @click="copyUrlToClipboard('iFrameUrl')">
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
        >Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ShareLinkDialog',
  props: {
    isActive: Boolean,
    sharedModel: Object,
  },
  data: () => ({
    dialog: false,
    toolTipMsg: 'Copy to clipboard',
  }),
  computed: {
    sharedModelUrl: (vm) => {
      if (vm.sharedModel) {
        return window.location.origin + '/share/' + vm.sharedModel._id;
      }
      return ''
    },
    sharedModelUrlWithPin: (vm) => {
      if (vm.sharedModel) {
        return window.location.origin + '/share/' + vm.sharedModel._id + '?pin=' + vm.sharedModel.pin;
      }
      return ''
    },
    freecadForumUrl: (vm) => {
      if (vm.sharedModel) {
        return `[ondsel]${vm.sharedModel._id}[/ondsel]`;
      }
      return ''
    },
    iFrameUrl: (vm) => {
      if (vm.sharedModel) {
        return `<iframe width="560" height="315" src="${vm.sharedModelUrl}" title="Ondsel"></iframe>`
      }
      return ''

    }
  },
  methods: {
    async copyToClipboard(textToCopy, reference) {
      this.$refs[reference].select();
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

    async copyUrlToClipboard(reference) {
      await this.copyToClipboard(this[reference], reference);
      this.toolTipMsg = 'Link copied!';
      setTimeout(() => {this.toolTipMsg = 'Copy to clipboard'}, 5000);
    },
  },
}
</script>

<style scoped>
</style>
