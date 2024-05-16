<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Change Short Description</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="workspaceDescDialogForm" @submit.prevent="doDescChange">
        <v-card-text>
          <v-text-field
            v-model.trim="newWorkspaceDesc"
            label="Description"
            hint="Enter a short description"
            maxlength="80"
            :rules="[rules.isRequired]"
            :disabled="isPatchPending"
          ></v-text-field>
          <small>Short description limited to a single line and 80 characters.</small>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="doDescChange()"
          color="primary"
          variant="elevated"
          :disabled="isPatchPending"
        >Change</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Workspace } = models.api;

export default {
  name: 'workspaceChangeDescDialog',
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
    allowNameChange: true,
    newWorkspaceDesc: '',
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async doDescChange() {
      this.newWorkspaceDesc = this.newWorkspaceDesc.trim();
      const { valid } = await this.$refs.workspaceDescDialogForm.validate();
      if (!valid) {
        return;
      }
      await Workspace.patch(
        this.workspace._id,
        {
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
