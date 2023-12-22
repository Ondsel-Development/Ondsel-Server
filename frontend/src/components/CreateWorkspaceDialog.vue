<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Create a Workspace</div>
      </template>
      <v-progress-linear
        :active="isCreatePending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="createDialogForm" @submit.prevent="createWorkspace">
        <v-card-text>
          <v-text-field
            v-model.trim="workspace.name"
            label="Name"
            hint="Enter name of a workspace"
            :rules="[rules.isRequired]"
            :disabled="isCreatePending"
          ></v-text-field>
          <v-text-field
            v-model.trim="workspace.description"
            label="Description"
            hint="Enter description of a workspace"
            :rules="[rules.isRequired]"
            :disabled="isCreatePending"
          ></v-text-field>
          <v-text-field
            v-model="nameTemp"
            label="reference name"
            :rules="[rules.isRequired, rules.nameConforms]"
            :disabled="isCreatePending"
          ></v-text-field>
          <v-card class="mx-auto" color="primary" variant="outlined">
            <v-card-text v-if="workspace.refName">
              <span class="font-weight-bold">{{workspace.refName}}</span>
            </v-card-text>
            <v-card-text v-else>
              <span class="font-italic">no reference name yet</span>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            :disabled="isCreatePending"
            :loading="isCreatePending"
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
import { models } from '@feathersjs/vuex';
import {conformRefName} from "@/refNameFunctions";

const { Workspace } = models.api;

export default {
  name: "CreateDirectoryDialog",
  props: {
    organization: Object,
  },
  data() {
    return {
      dialog: false,
      nameTemp: '',
      lastBadRefName: '',
      extraHintContent: '',
      workspace: {
        name: '',
        description: '',
        refName: '',
      },
      rules: {
        isRequired: v => !!v || 'This field is required',
        nameConforms: v => this.conformNameCheck(v),
      },
      snackerMsg: '',
      showSnacker: false,
    }
  },
  computed: {
    ...mapState('workspaces', ['isCreatePending']),
  },
  methods: {
    async createWorkspace() {
      const { valid } = await this.$refs.createDialogForm.validate();
      if (!valid) {
        return;
      }
      await Workspace.create({
        name: this.workspace.name,
        refName: this.workspace.refName,
        description: this.workspace.description,
        organizationId: this.organization._id,
      })
      .then(async () => {
        this.workspace = {
          name: '',
          refName: '',
          description: ''
        };
        this.nameTemp = '';
        this.dialog = false;
      })
      .catch((e) => {
        if (e.message === 'Invalid: reference name already taken') {
          this.extraHintContent = `reference name ${this.workspace.refName} already taken at this org`;
          this.lastBadRefName = this.workspace.refName;
        }
        console.log(e.message);
        this.snackerMsg = e.message;
        this.showSnacker = true;
      });
    },
    conformNameCheck(rawName) {
      const conformedName = conformRefName(rawName);
      this.workspace.refName = conformedName;
      if (conformedName.length < 4) {
        return "requires at least 4 characters in derived username";
      }
      if (this.extraHintContent === '') {
        return true;
      }
      if (this.lastBadRefName === conformedName) {
        return this.extraHintContent;
      }
      return true;
    },
  }
}
</script>

<style scoped>

</style>
