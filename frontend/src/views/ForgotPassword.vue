<template>
  <v-container fluid class="fill-height">
    <v-card title="Password Reset Using Email" class="mx-auto position-relative" width="400" style="top: -100px" flat>
      <template v-slot:loader="{ isActive }">
        <v-progress-linear
          :active="isResetPending"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>

      <v-text-field
        v-model="email"
        label="Email"
        :rules="[rules.isRequired, rules.isEmail]"
        :disabled="isResetPending"
        autofocus
      ></v-text-field>

      <v-card-actions>
      <v-btn @click="sendResetEmail()" v-bind:disabled="isResetPending" block class="mt-2">Submit</v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar
      :timeout="2000"
      v-model="showSnacker"
    >
      {{ snackerMsg }}
    </v-snackbar>
  </v-container>
</template>

<script>

import { resetStores } from '@/store';
import {AuthManagement} from "@/store/services/auth-management";

export default {
  name: 'ForgotPassword',
  data() {
    return {
      result: {},
      email: '',
      isValid: false,
      rules: {
        isEmail: v => /^\S+@\S+\.\S+$/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
      },
      snackerMsg: '',
      showSnacker: false,
      isResetPending: false,
    }
  },
  computed: {
  },
  mounted() {
    resetStores();
  },
  methods: {
    async sendResetEmail() {
      this.isResetPending = true;
      await AuthManagement.create({
        action: "sendResetPwd",
        value: {email: this.email},
        notifierOptions: {},
      }).then(() => {
        this.$router.push({ name: 'Login' })
      }).catch(() => {
        // const msg = e.message;
        this.$router.push({ name: 'Login' })
      });
      this.isResetPending = false;
    }
  }
}
</script>

<style scoped>

</style>
