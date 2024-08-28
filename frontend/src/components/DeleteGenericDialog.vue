<template>
  <v-dialog
    v-model="showDialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="600">
      <template v-slot:title>
        <div class="text-center">Delete {{title}}?</div>
      </template>
    <v-card-text class="pa-12">
      <p>{{warningMessage}}</p>
      <v-sheet v-if="errorMessage" class="mt-2" color="error">
        <p>{{ errorMessage }}</p>
      </v-sheet>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        color="cancel"
        variant="elevated"
        @click="cancelDelete"
      >Cancel</v-btn>
      <v-btn
        color="error"
        variant="elevated"
        @click="deleteObject"
      >Delete</v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: {
    title: String,
    warningMessage: String,
    errorMessage: String,
  },
  emits: ['delete'],
  data() {
    return {
      showDialog: false
    };
  },
  computed: {
  },
  methods: {
    deleteObject() {
      this.$emit('delete');
    },
    cancelDelete() {
      this.showDialog = false;
    }
  }
};
</script>
