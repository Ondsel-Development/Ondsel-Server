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
        <div class="text-center">{{title}}</div>
      </v-card-title>
      <v-card-subtitle>{{subtitle}}</v-card-subtitle>
      <v-card-text>
        <v-progress-linear
          :active="isPatchPending"
          indeterminate
          absolute
          bottom
        ></v-progress-linear>
        <p class="text-caption mb-2">was: {{currentSelection}}</p>
        <v-radio-group v-model="finalSelection">
          <v-radio
            v-for="item in selectionList"
            :key="item.order"
            :label="item.label"
            :value="item.value"
          >
          </v-radio>
        </v-radio-group>
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
          @click="sendFinalSelection()"
          color="primary"
          variant="elevated"
          :disabled="isPatchPending"
          :loading="isPatchPending"
        >Change</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'GenericSelectionDialog',
  props: {
    currentSelection: String,
    selectionList: Array,
    title: String,
    subtitle: String,
  },
  emits: ['saveGenericSelection'],
  async created() {
  },
  data: () => ({
    dialog: false,
    finalSelection: '',
    snackerMsg: '',
    showSnacker: false,
    isPatchPending: false,
  }),
  computed: {
  },
  methods: {
    async sendFinalSelection() {
      this.$emit('saveGenericSelection');
    },
  },
}
</script>
<style scoped>
</style>
