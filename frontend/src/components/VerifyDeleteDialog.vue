<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    width="auto"
    v-model="dialog"
  >
    <v-card width="34em">
      <v-card-title>
        <v-sheet class="d-flex justify-center">Delete {{targetName}}?</v-sheet>
      </v-card-title>
      <v-card-subtitle>{{targetSubtitle}}</v-card-subtitle>
      <v-card-text>
        <p>
          Are you sure you want to delete <b>{{ targetName }}</b>?
        </p>
        <p>
          This will have the following effects:
          <v-sheet
            class="d-flex flex-column"
          >
            <v-sheet
              v-for="warning in warnings"
              :key="warning"
              class="d-flex flex-row mt-4"
              width="28em"
            >
              <v-icon class="mr-2 align-center">mdi-alert-octagon</v-icon>
              <v-sheet class="text-wrap">{{warning}}</v-sheet>
            </v-sheet>
          </v-sheet>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="secondary"
          variant="elevated"
          @click="cancelDelete()"
        >Cancel</v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="deleteTarget()"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: {},
  emits: ['deleteApproved'],
  data: () => ({
    dialog: false,
    targetName: 'tbd', // to be set by caller
    targetSubtitle: '', // optional; to be set by caller
    targetWarnings: [], // to be set by caller; there should be at least one.
  }),
  computed: {},
  methods: {
    deleteTarget() {
      this.$emit('deleteApproved');
      this.dialog = false;
    },
    cancelDelete() {
      this.dialog = false;
    }
  }
};
</script>
