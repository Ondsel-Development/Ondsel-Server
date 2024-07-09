<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="34em" max-height="800">
      <v-card-title>
        <div class="text-center">Create a Directory</div>
      </v-card-title>
      <v-card-subtitle>
        Under directory <code class="text-teal">{{parentDir.name}}</code>
      </v-card-subtitle>
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
          <v-btn
            color="cancel"
            variant="elevated"
            @click="dialog = false"
          >Cancel</v-btn>
          <v-btn
            type="submit"
            variant="elevated"
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
  props: {
    parentDir: {
      Type: Object,
      required: true,
    }
  },
  data: () => ({
    dialog: false,
    directoryName: '',
    rules: [
      v => !!v || 'Directory name is required',
      v => !/[\/\\:]/.test(v) || 'Directory name must not include /, \\ and : characters'
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
      this.$emit('createDirectory', this.directoryName, this.parentDir);
    }
  }
}
</script>

<style scoped>

</style>
