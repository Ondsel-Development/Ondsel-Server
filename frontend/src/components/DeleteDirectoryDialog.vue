<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Delete this Directory</div>
      </template>
      <v-progress-linear
        :active="isDeletePending || isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="deleteDialogForm" @submit.prevent="deleteDirectory">
        <v-card-text>
          <v-card-text>
            <p>Are you sure you want to delete <b>{{ directoryName }}</b>?</p>
          </v-card-text>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            @click="dialog = false"
          >Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            :disabled="isDeletePending || isPatchPending"
          >Delete</v-btn>
        </v-card-actions>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
    </v-card>
  </v-dialog>

</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "DeleteDirectoryDialog",
  emits: ['deleteDirectory'],
  props: {
    directoryName: String,
  },
  data: () => ({
    dialog: false,
    showSnacker: false,
    snackerMsg: '',
  }),
  computed: {
    ...mapState('directories', ['isDeletePending', 'isPatchPending']),
  },
  methods: {
    async deleteDirectory() {
      this.$emit('deleteDirectory');
    }
  }
}
</script>

<style scoped>

</style>
