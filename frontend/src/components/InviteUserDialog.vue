<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Create Invite to <b>{{ organization.name }}</b></div>
      </template>
      <v-progress-linear
        :active="isInviteInProgress"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="form" @submit.prevent="inviteUser">
        <v-card-text>
          <v-text-field
            v-model.trim="email"
            label="Email"
            hint="Enter invite user email"
            :disabled="isInviteInProgress"
            :rules="[rules.isEmail]"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false;">Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            :disabled="isInviteInProgress"
          >Send</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "InviteUserDialog",
  props: {
    organization: Object,
  },
  data: () => ({
    dialog: false,
    email: '',
    isInviteInProgress: false,
    rules: {
      isEmail: v => /^\S+@\S+\.\S+$/.test(v) || 'Invalid Email address',
    }
  }),
  methods: {
    async inviteUser() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.isInviteInProgress = true;
      console.log(`Inviting ${this.email} user to ${this.organization.name}...`)
      this.isInviteInProgress = false;
      this.dialog = false;
    }
  }
}
</script>

<style scoped>

</style>
