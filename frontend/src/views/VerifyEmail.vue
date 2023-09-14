<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Email Verification</v-card-title>
      <v-card-text>
        <h1>{{verificationMsg}}</h1>
        <h1>&nbsp;</h1>
        <h1 v-if="isVerified">Email Address Verified!</h1>
        <p>{{loginMsg}}</p>
        <p>token: {{ token }}</p>
        <v-container width="400" style="top: -100px" flat>
          <v-form v-model="isValid" @submit.prevent="login">
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

            <v-card-actions>
              <v-btn type="submit" block class="mt-2" :disabled="!isVerified">Submit</v-btn>
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
import {models} from "@feathersjs/vuex";
import {resetStores} from "@/store";
import {AuthManagement} from "@/store/services/auth-management";

export default {
  name: 'VerifyEmail',
  data() {
    return {
      result: {},
      isValid: false,
      isVerified: false,
      verificationMsg: 'please wait, verifying ...',
      loginMsg: '',
      user: {
        email: '',
        password: ''
      },
      rules: {
        isEmail: v => /.+@.+/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
      },
      snackerMsg: '',
      showSnacker: false,
      token: this.$route.params.token,
      uid: this.$route.params.uid,
    }
  },
  computed: {
    User: () => models.api.User,
  },
  mounted() {
    resetStores();
  },
  async created() {
    await AuthManagement.create({
      action: "verifySignupLong",
      value: this.token,
      notifierOptions: {},
    }).then(() => {
      this.isVerified = true;
      this.loginMsg = 'Now please login.';
    }).catch((e) => {
      const msg = e.message;
      if (msg === 'User not found.') {
        this.isVerified = true;
        this.loginMsg = 'Go ahead and login.'
        this.verificationMsg = 'Verification code either already used or expired.'
      } else {
        this.verificationMsg = msg;
      }
    });
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async login() {
      if ( this.isValid ) {
        this.authenticate({
          strategy: 'local',
          ...this.user,
        }).then(() => {
          this.$router.push({ name: 'ChooseTier' })
        }).catch(() => {
          this.showSnacker = true;
          this.snackerMsg = "Invalid login"
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
