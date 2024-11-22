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
        <div class="text-center">Change Email Address</div>
      </template>
      <v-progress-linear
        :active="pendingChangeEmail"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <v-form ref="form" @submit.prevent="changeEmail">
          <v-text-field
            v-model.trim="confirmationPassword"
            label="Password"
            type="password"
            hint="please confirm your password"
            :disabled="pendingChangeEmail"
            :rules="[rules.isRequired, rules.minCharacter]"
          ></v-text-field>
          <v-text-field
            v-model.trim="newEmailAddress"
            label="New email address"
            :disabled="pendingChangeEmail"
            :rules="[rules.isRequired, rules.isEmail]"
          ></v-text-field>
        </v-form>
        <p>
          Once you press "Change Email", an email will be sent to the new address containing a confirmation link. Nothing
          will change until that email is confirmed.
        </p>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="changeEmail()"
          color="primary"
          variant="elevated"
          :disabled="pendingChangeEmail"
        >Change Email</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {AuthManagement} from "@/store/services/auth-management";

export default {
  name: 'ChangeEmailDialog',
  props: {
    user: {}
  },
  data: () => ({
    pendingChangeEmail: false,
    dialog: false,
    confirmationPassword: '',
    newEmailAddress: '',
    rules: {
      isEmail: v => /^\S+@\S+\.\S+$/.test(v) || 'Invalid Email address',
      isRequired: v => !!v || 'This field is required',
      minCharacter: v => (v && v.length >= 8) || 'Minimum 8 characters',

    }
  }),
  computed: {
  },
  methods: {
    async changeEmail() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.pendingChangeEmail = true;
      await AuthManagement.create({
        action: "identityChange",
        value: {
          user: {email: this.user.email},
          password: this.confirmationPassword,
          changes: {email: this.newEmailAddress},
        },
        notifierOptions: {},
      }).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
      this.pendingChangeEmail = false;
    }
  },
}
</script>

<style scoped>
</style>
