<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Change Password</v-card-title>
      <v-card-text>
        <h1>{{verificationMsg}}</h1>
        <h1>&nbsp;</h1>
        <p>{{loginMsg}}</p>
        <p>token: {{ token }}</p>
        <v-container width="400" style="top: -100px" flat>
          <v-form v-if="showForm" v-model="isValid" @submit.prevent="loginAndChangePassword">
            <v-text-field
              v-model="user.email"
              label="Email"
              :rules="[rules.isRequired, rules.isEmail]"
              autofocus
            ></v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              type="password"
              :rules="[rules.isRequired]"
            ></v-text-field>

            <v-text-field
              v-model="newPassword"
              label="New Password"
              type="password"
              :rules="[rules.isRequired, rules.minCharacter]"
            ></v-text-field>

            <v-text-field
              v-model="confirmPassword"
              label="Confirm New Password"
              type="password"
              :rules="[rules.isRequired, rules.confirmPassword]"
            ></v-text-field>

            <v-card-actions>
              <v-btn type="submit" block class="mt-2" :disabled="!isValid">Submit</v-btn>
            </v-card-actions>
          </v-form>
        </v-container>
        <v-snackbar
          :timeout="2000"
          v-model="showSnacker"
        >
          {{ snackerMsg }}
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapActions} from "vuex";
import {resetStores} from "@/store";
import {AuthManagement} from "@/store/services/auth-management";

export default {
  name: 'VerifyEmail',
  data() {
    return {
      result: {},
      isValid: false,
      verificationMsg: '',
      loginMsg: '',
      user: {
        email: '',
        password: ''
      },
      rules: {
        isEmail: v => /.+@.+/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
        minCharacter: v => (v && v.length >= 8) || 'Minimum 8 characters',
        confirmPassword: v => v === this.newPassword || 'Password must match',
      },
      snackerMsg: '',
      showSnacker: false,
      token: this.$route.params.token,
      uid: this.$route.params.uid,
      newPassword: '',
      confirmPassword: '',
      showForm: true,
    }
  },
  computed: {
  },
  mounted() {
    resetStores();
  },
  async created() {
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async loginAndChangePassword() {
      if ( this.isValid ) {
        this.authenticate({
          strategy: 'local',
          ...this.user,
        }).then(() => {
          this.showSnacker = true;
          this.snackerMsg = "Logged in. Attempting password change..."
          AuthManagement.create({
            action: "resetPwdLong",
            value: {token: this.token, password: this.newPassword},
            notifierOptions: {},
          }).then(() => {
            this.snackerMsg = "Password change success.";
            this.verificationMsg = 'Password Changed!';
            this.showForm = false;
          }).catch((e) => {
            const msg = e.message;
            if (msg === 'User not found.') {
              this.verificationMsg = 'This security token has either expired, already used, or replaced by a new one. Please visit the Account Setting page to try again.';
            } else {
              this.verificationMsg = 'Unable to reset password.';
            }
          });
        }).catch(() => {
          this.showSnacker = true;
          this.snackerMsg = "Invalid login"
        })
      }
    },
    async login() {
    }
  }
}
</script>

<style scoped>

</style>
