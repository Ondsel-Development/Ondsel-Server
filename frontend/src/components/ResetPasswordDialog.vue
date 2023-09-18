<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Reset Password</div>
      </template>
      <v-card-text>
        Clicking on "Send Email" below will cause Ondsel to send an email to {{user.email}}. The email will contain
        a link (containing a security code) allowing you to reset your password.
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="sendResetEmail()" color="primary">Send Email</v-btn>
        <v-btn @click="dialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ResetPasswordDialog',
  props: {
    user: {}
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
  },
  methods: {
    sendResetEmail() {
      this.dialog = false;
    }
  },
}
</script>

<style scoped>
</style>
