<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto position-relative" width="400" style="top: -100px" flat>
      <v-card-title>Change Password</v-card-title>
      <v-progress-linear
        :active="pendingPasswordChange"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <p class="text-high-emphasis">{{forgotPasswordMsg}}</p>
        <p class="text-button">{{verificationMsg}}</p>
        <v-form v-model="isValid" @submit.prevent="changePasswordFormHandler">
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
            <v-btn type="submit" block class="mt-2" :disabled="!isValid || pendingPasswordChange">Submit</v-btn>
          </v-card-actions>
        </v-form>
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

import {mapActions, mapState} from "vuex";
import {resetStores} from "@/store";
import {AuthManagement} from "@/store/services/auth-management";
import {models} from "@feathersjs/vuex";
const { User } = models.api;

export default {
  name: 'VerifyEmail',
  data() {
    return {
      result: {},
      isValid: false,
      verificationMsg: '',
      forgotPasswordMsg: 'reset password:',
      user: {
        email: 'ignore@ignore.com',
        password: ''
      },
      rules: {
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
      pendingPasswordChange: false,
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  mounted() {
    resetStores();
  },
  async created() {
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    ...mapActions('auth', {authLogout: 'logout'}),
    logout() {
      console.log("FORCED LOGOUT");
      this.authLogout().then(() => this.$router.go() ); // logout and refresh page
    },
    async nowChangePassword() {
      this.pendingPasswordChange = true;
      AuthManagement.create({
        action: "resetPwdLong",
        value: {token: this.token, password: this.newPassword},
        notifierOptions: {},
      }).then(() => {
        this.verificationMsg = 'Password Changed!';
        if (this.loggedInUser) {
          this.$router.push({name: 'Models', params: {slug: this.loggedInUser.user.username}});
        } else {
          this.$router.push({name: 'Login'});
        }
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
        if (msg === 'User not found.') {
          this.verificationMsg = 'This security token has either expired, already used, or replaced by a new one. Please visit the Account Setting page to try again.';
        } else if(msg === 'Password reset token has expired.') {
          this.verificationMsg = 'This security token has expired. Please visit the "Account Settings" page to send a new Password Reset email.';
        } else {
          this.verificationMsg = 'Unable to reset password.';
        }
      });
      this.pendingPasswordChange = false;
    },
    async changePasswordFormHandler() {
      if (this.loggedInUser) {
        if (this.loggedInUser.user.email !== this.user.email) {
          // someone is trying to be hacker and resetting a different account with this token
          // (the backend system should ALSO catch such border conditions.)
          this.logout(); // forces a reset
          return;
        }
      }
      await this.nowChangePassword();
    },
  }
}
</script>

<style scoped>

</style>
