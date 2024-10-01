<template>
  <v-dialog
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <v-card-title>
        <div class="text-center">
          Open model in Ondsel ES
        </div>
      </v-card-title>
      <v-card-text>
        Don’t have the Ondsel ES app installed?
        <router-link :to="{name: 'DownloadAndExplore'}">Download Now</router-link>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false;"
        >Close</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="launchingInProgress"
          @click="$emit('launchOndselEs')"
        >Launch Ondsel ES</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: 'LaunchOndselEsDialog',
  emits: ['launchOndselEs'],
  props: {
    launchingInProgress: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    dialog: false,
  }),
  methods: {
    openDialog() {
      this.dialog = true;
    }
  }
}
</script>

<style scoped>

</style>
