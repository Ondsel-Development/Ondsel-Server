<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-btn
    icon="mdi-delete-forever"
    density="comfortable"
    @click.stop="showDialog = true"
    :loading="isIdRemovePending.includes(model._id)"
  ></v-btn>
  <v-dialog
    v-model="showDialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="600">
      <template v-slot:title>
        <div class="text-center">Delete Model?</div>
      </template>
    <v-card-text class="pa-12">
      <p>Are you sure you want to delete the <b>{{ model.customerFileName }}</b> model? Deleting this model will also delete
      all its share links.</p>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        color="cancel"
        variant="elevated"
        @click="cancelDelete"
      >Cancel</v-btn>
      <v-btn
        color="primary"
        variant="elevated"
        @click="deleteObject"
      >Delete</v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  emits: ['deleteModel'],
  data() {
    return {
      showDialog: false
    };
  },
  computed: {
    ...mapState('models', ['isIdRemovePending']),
  },
  methods: {
    deleteObject() {
      this.$emit('deleteModel', this.model);
      this.showDialog = false;
    },
    cancelDelete() {
      this.showDialog = false;
    }
  }
};
</script>
