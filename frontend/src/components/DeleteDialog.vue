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
      <p>Are you sure you want to delete <b>{{ model.customerFileName }}</b> model? Deleting model also delete
      it's share links if exist.</p>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn color="primary" @click="deleteObject">Delete</v-btn>
      <v-btn @click="cancelDelete">Cancel</v-btn>
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
