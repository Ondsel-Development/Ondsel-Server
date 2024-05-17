<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card max-width="40em" min-width="22em">
      <template v-slot:title>
        <div class="text-center">Reset Password</div>
      </template>
      <v-progress-linear
        :active="pendingPasswordEmail"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        Clicking on "Send Email" below will cause Ondsel to send an email to {{user.email}}. The email will contain
        a link (containing a security code) allowing you to reset your password.
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="sendResetEmail()"
          color="primary"
          variant="elevated"
          :disabled="pendingPasswordEmail"
        >Send Email</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {AuthManagement} from "@/store/services/auth-management";

export default {
  name: 'ResetPasswordDialog',
  props: {
    user: {}
  },
  data: () => ({
    pendingPasswordEmail: false,
    dialog: false,
  }),
  computed: {
  },
  methods: {
    async sendResetEmail() {
      this.pendingPasswordEmail = true;
      await AuthManagement.create({
        action: "sendResetPwd",
        value: {email: this.user.email},
        notifierOptions: {},
      }).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
      this.pendingPasswordEmail = false;
    }
  },
}
</script>

<style scoped>
</style>
