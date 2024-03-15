<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card max-width="40em" min-width="22em">
      <template v-slot:title>
        <div class="text-center">Edit Description</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="editDescriptionDialogForm" @submit.prevent="isPatchPending">
        <v-card-text>
          <v-text-field
            v-model.trim="newDescription"
            label="Description"
            hint="Enter a short description"
            maxlength="80"
            :disabled="isPatchPending"
          ></v-text-field>
          <small>Short description limited to a single line and 80 characters.</small>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn @click="doSaveDescription()" color="primary" :disabled="isPatchPending">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {marked} from "marked";

export default {
  name: 'EditDescriptionDialog',
  props: {
    description: {
      Type: Text,
      default: '',
    }
  },
  emits: ['saveDescription'],
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    newDescription: '',
    isPatchPending: false,
  }),
  computed: {
  },
  methods: {
    async doSaveDescription() {
      this.$emit('saveDescription');
    },
  },
  watch: {
    async dialog(newVal) {
      if (newVal === true) {
        this.newDescription = this.description;
      }
    }
  }
}
</script>
<style scoped>
</style>
