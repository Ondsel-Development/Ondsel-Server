<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Create a Directory</div>
      </template>
      <v-progress-linear
        :active="isCreatePending || isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="createDialogForm" @submit.prevent="createDirectory">
        <v-card-text>
          <v-card-text>
            <v-text-field
              ref="directoryNameField"
              v-model.trim="directoryName"
              label="Directory Name"
              hint="Enter name of a directory"
              :rules="rules"
              :disabled="isCreatePending || isPatchPending"
            ></v-text-field>
          </v-card-text>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            :disabled="isCreatePending || isPatchPending"
          >Create</v-btn>
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
  name: "CreateDirectoryDialog",
  emits: ['createDirectory'],
  data: () => ({
    dialog: false,
    directoryName: '',
    rules: [
      v => !!v || 'Directory name is required',
    ],
    snackerMsg: '',
    showSnacker: false,
  }),
  computed: {
    ...mapState('directories', ['isCreatePending', 'isPatchPending']),
  },
  methods: {
    async createDirectory() {
      const { valid } = await this.$refs.createDialogForm.validate();
      if (!valid) {
        return;
      }
      this.$emit('createDirectory', this.directoryName);
    }
  }
}
</script>

<style scoped>

</style>
