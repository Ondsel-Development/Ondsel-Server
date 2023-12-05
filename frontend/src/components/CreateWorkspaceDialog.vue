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
    </v-card>
  </v-dialog>

</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import rules from '@/mixins/rules';

const { Workspace } = models.api;

export default {
  name: "CreateDirectoryDialog",
  props: {
    organization: Object,
  },
  mixins: [rules],
  data: () => ({
    dialog: false,
    workspace: {
      name: '',
      description: ''
    },
  }),
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
        description: this.workspace.description,
        organizationId: this.organization._id,
      });
      this.dialog = false;
      this.workspace = {
        name: '',
        description: ''
      }
    }
  }
}
</script>

<style scoped>

</style>
