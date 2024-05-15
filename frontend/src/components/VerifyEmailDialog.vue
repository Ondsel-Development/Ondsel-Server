<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Verify Email</div>
      </template>
      <v-progress-linear
        :active="pendingVerifyEmail"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        Clicking on "Send Email" below will cause Ondsel to send an email to {{user.email}}. The email will contain
        a link (containing a security code) allowing you to verify the email account.
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="sendVerifyEmail()"
          color="primary"
          variant="elevated"
          :disabled="pendingVerifyEmail"
        >Send Email</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {AuthManagement} from "@/store/services/auth-management";

export default {
  name: 'VerifyEmailDialog',
  props: {
    user: {}
  },
  data: () => ({
    pendingVerifyEmail: false,
    dialog: false,
  }),
  computed: {
  },
  methods: {
    async sendVerifyEmail() {
      this.pendingVerifyEmail = true;
      await AuthManagement.create({
        action: "resendVerifySignup",
        value: {email: this.user.email},
        notifierOptions: {},
      }).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
      this.pendingVerifyEmail = false;
    }
  },
}
</script>

<style scoped>
</style>
