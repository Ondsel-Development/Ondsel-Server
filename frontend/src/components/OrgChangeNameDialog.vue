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
        :active="pendingChangeName"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="changeNameDialogForm" @submit.prevent="pendingChangeName">
        <v-card-text>
          <v-text-field
            v-model.trim="newOrgName"
            label="Name"
            hint="Enter the organization's name"
            :rules="[rules.isRequired]"
            :disabled="pendingChangeName"
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
        <v-btn @click="doNameChange()" color="primary" :disabled="pendingChangeName">Change</v-btn>
        <v-btn @click="dialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {models} from "@feathersjs/vuex";

const { Organization } = models.api;

export default {
  name: 'orgChangeNameDialog',
  props: {
    org: {}
  },
  created() {
    this.newOrgName = this.org.name;
  },
  data: () => ({
    pendingChangeName: false,
    dialog: false,
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
    snackerMsg: '',
    showSnacker: false,
    newOrgName: '',
  }),
  computed: {
  },
  methods: {
    async doNameChange() {
      this.newOrgName = this.newOrgName.trim();
      const { valid } = await this.$refs.changeNameDialogForm.validate();
      if (!valid) {
        return;
      }
      this.pendingChangeName = true;
      await Organization.patch(
        this.org._id,
        {
          name: this.newOrgName,
        }
      ).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
      this.pendingChangeName = false;
    }
  },
}
</script>

<style scoped>
</style>
