<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Change Name</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="workspaceNameDialogForm" @submit.prevent="isPatchPending">
        <v-card-text>
          <v-text-field
            v-if="allowNameChange"
            v-model.trim="newWorkspaceName"
            label="Name"
            hint="Enter the workspace's name"
            maxlength="48"
            :rules="[rules.isRequired]"
            :disabled="isPatchPending"
          ></v-text-field>
          <v-text-field
            v-if="!allowNameChange"
            v-model.trim="newWorkspaceName"
            label="Name"
            disabled
          ></v-text-field>
          <small>Name limited to 48 characters.</small>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn @click="doNameChange()" color="primary" :disabled="isPatchPending">Change</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Workspace } = models.api;

export default {
  name: 'workspaceChangeNameDialog',
  props: {
    workspace: {}
  },
  created() {
  },
  data: () => ({
    dialog: false,
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
    snackerMsg: '',
    showSnacker: false,
    newWorkspaceName: '',
    allowNameChange: true,
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async doNameChange() {
      this.newWorkspaceName = this.newWorkspaceName.trim();
      const { valid } = await this.$refs.workspaceNameDialogForm.validate();
      if (!valid) {
        return;
      }
      await Workspace.patch(
        this.workspace._id,
        {
          name: this.newWorkspaceName
        }
      ).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
    }
  },
}
</script>

<style scoped>
</style>
