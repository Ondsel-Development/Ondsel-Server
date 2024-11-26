<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

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
      <v-progress-linear
        :active="pendingPasswordEmail"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form v-model="isValid" @submit.prevent="sendResetEmail">
      <v-card-text>
        Fill out your account's email address and click "Send Email" below. Ondsel will send an email with
        a link (containing a security code) allowing you to reset your password.
      </v-card-text>
      <v-text-field
        v-model="email"
        label="Email"
        :rules="[rules.isRequired, rules.isEmail]"
        :disabled="pendingPasswordEmail"
        autofocus
      ></v-text-field>
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
      </v-form>
    </v-card>
    <v-snackbar
      :timeout="2000"
      v-model="showSnacker"
    >
      {{ snackerMsg }}
    </v-snackbar>
  </v-dialog>
</template>

<script>
import {AuthManagement} from "@/store/services/auth-management";
export default {
  name: 'ForgotPasswordDialog',
  data: () => ({
    isValid: false,
    pendingPasswordEmail: false,
    dialog: false,
    email: "",
    rules: {
      isEmail: v => /^\S+@\S+\.\S+$/.test(v) || 'Invalid Email address',
      isRequired: v => !!v || 'This field is required',
    },
    snackerMsg: '',
    showSnacker: false,
  }),
  computed: {
  },
  methods: {
    async sendResetEmail() {
      this.pendingPasswordEmail = true;
      await AuthManagement.create({
        action: "sendResetPwd",
        value: {email: this.email},
        notifierOptions: {},
      }).then(() => {
        this.dialog = false;
      }).catch((e) => {
        this.snackerMsg = e.message;
        this.showSnacker = true;
      });
      this.pendingPasswordEmail = false;
    }
  },
}
</script>

<style scoped>
</style>
