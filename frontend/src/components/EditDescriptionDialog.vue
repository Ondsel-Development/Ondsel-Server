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
    <v-card max-width="40em" min-width="22em">
      <v-card-title>
        <div class="text-center">{{finalLabel}}</div>
      </v-card-title>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="editDescriptionDialogForm" @submit.prevent="doSaveDescription">
        <v-card-text>
          <v-text-field
            v-model.trim="newDescription"
            label="Description"
            hint="Enter a short description"
            maxlength="80"
            :disabled="isPatchPending"
          ></v-text-field>
          <small>limited to a single line and 80 characters.</small>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false" color="cancel" variant="elevated">Cancel</v-btn>
        <v-btn @click="doSaveDescription()" color="primary" variant="elevated" :disabled="isPatchPending">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'EditDescriptionDialog',
  props: {
    description: {
      Type: Text,
      default: null,
    },
    label: {
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
    finalLabel: '',
    isPatchPending: false,
  }),
  async created() {
    this.finalLabel = this.$props.label || "Edit Description";
  },
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
        if (this.description !== null) {
          this.newDescription = this.description;
        }
      }
    },
  }
}
</script>
<style scoped>
</style>
