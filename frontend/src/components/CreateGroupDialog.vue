<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Create Group</div>
      </template>
      <v-progress-linear
        :active="isCreatePending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="form" @submit.prevent="createGroup">
        <v-card-text>
          <v-text-field
            v-model.trim="groupName"
            label="Name"
            hint="Enter name of a group"
            :disabled="isCreatePending"
            :rules="[rules.isRequired]"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            @click="dialog = false;"
          >Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            :disabled="isCreatePending"
          >Create</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

const { Group } = models.api;

export default {
  name: "CreateGroupDialog",
  props: {
    organization: Object,
  },
  data: () => ({
    dialog: false,
    groupName: '',
    rules: {
      isRequired: v => !!v || 'This field is required',
    }
  }),
  computed: {
    ...mapState('groups', ['isCreatePending']),
  },
  methods: {
    async createGroup() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      await Group.create({ name: this.groupName, organizationId: this.organization._id, takeAllNewUsers: true})
      this.dialog = false;
    }
  }
}
</script>

<style scoped>

</style>
