<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Change Name and Description</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="workspaceNameDescDialogForm" @submit.prevent="isPatchPending">
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
          <v-text-field
            v-model.trim="newWorkspaceDesc"
            label="Description"
            hint="Enter a short description"
            maxlength="80"
            :rules="[rules.isRequired]"
            :disabled="isPatchPending"
          ></v-text-field>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="doNameDescChange()" color="primary" :disabled="isPatchPending">Change</v-btn>
        <v-btn @click="dialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Workspace } = models.api;

export default {
  name: 'workspaceChangeNameDescDialog',
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
    newWorkspaceDesc: '',
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async doNameDescChange() {
      this.newWorkspaceName = this.newWorkspaceName.trim();
      this.newWorkspaceDesc = this.newWorkspaceDesc.trim();
      const { valid } = await this.$refs.workspaceNameDescDialogForm.validate();
      if (!valid) {
        return;
      }
      await Workspace.patch(
        this.workspace._id,
        {
          name: this.newWorkspaceName,
          description: this.newWorkspaceDesc,
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
