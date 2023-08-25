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
            <v-btn icon flat @click="copyUrlToClipboard('sharedModelUrl')">
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
        <v-card-title>Share in FreeCAD Forum</v-card-title>
        <v-text-field
          v-model="freecadForumUrl"
          ref="freecadForumUrl"
          readonly
        >
          <template v-slot:append>
            <v-btn icon flat @click="copyUrlToClipboard('freecadForumUrl')">
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
            <v-btn icon flat @click="copyUrlToClipboard('iFrameUrl')">
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
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ShareLinkDialog',
  props: {
    isActive: Boolean,
    sharedModelId: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    dialog: false,
    toolTipMsg: 'Copy to clipboard',
  }),
  computed: {
    sharedModelUrl: (vm) => {
      if (vm.sharedModelId) {
        return window.location.origin + '/share/' + vm.sharedModelId;
      }
      return ''
    },
    freecadForumUrl: (vm) => {
      if (vm.sharedModelId) {
        return `[ondsel]${vm.sharedModelId}[/ondsel]`;
      }
      return ''
    },
    iFrameUrl: (vm) => {
      if (vm.sharedModelId) {
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
