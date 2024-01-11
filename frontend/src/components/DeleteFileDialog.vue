<template>
  <v-dialog
    v-model="showDialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Delete File</div>
      </template>
      <v-progress-linear
        :active="isRemovePending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <p>Are you sure you want to delete <b>{{ file.custFileName }}</b>?</p>
        Deleting this file also deletes:
        <ul>
          <li>All file revisions</li>
          <li>Any 3D models of the file (current or past)</li>
          <li>All share links to any of the file's revisions</li>
        </ul>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" :loading="isRemovePending" @click="deleteObject">Delete</v-btn>
        <v-btn :disabled="isRemovePending" @click="cancelDelete">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapState } from 'vuex'
import { models } from '@feathersjs/vuex';

const {File} = models.api;

export default {
  name: 'DeleteFileDialog',
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  emits: ['doneWithFile'],
  data() {
    return {
      showDialog: false
    };
  },
  computed: {
    ...mapState('file', ['isRemovePending']),
  },
  methods: {
    async deleteObject() {
      await File.remove(
        this.file._id
      ).then(() => {
        this.$emit('doneWithFile');
        this.showDialog = false;
      }).catch((e) => {
        console.log(e);
      });
    },
    cancelDelete() {
      this.showDialog = false;
    },
    openDeleteFileDialog() {
      this.showDialog = true;
    }
  }
};
</script>
