<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto position-relative" width="400" style="top: -100px" flat>
      <v-card-title>Email Verification</v-card-title>
      <v-card-text>
        <p class="text-button">{{verificationMsg}}</p>
        <v-form v-model="isValid" @submit.prevent="login" v-if="showLoginForm">
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
            <v-btn type="submit" block class="mt-2" :disabled="!isValid">Submit</v-btn>
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
import {models} from "@feathersjs/vuex";
import {resetStores} from "@/store";
import {AuthManagement} from "@/store/services/auth-management";
import {AccountEventTypeMap} from "@/store/services/accountEvent";
import {SubscriptionTermTypeMap, SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'VerifyEmail',
  data() {
    return {
      result: {},
      isValid: false,
      verificationMsg: '...',
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
      accountEvent: new models.api.AccountEvent(),
      showLoginForm: false,
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  mounted() {
    resetStores();
  },
  async created() {
    if (this.loggedInUser && this.loggedInUser.user) {
      const verifyResult = await this.verifyEmailAddress();
      if (verifyResult === true) {
        await this.upgradeAccount(this.loggedInUser.user);
      } else {
        this.verificationMsg = verifyResult;
      }
    } else {
      this.verificationMsg = 'please login to complete verification:'
      this.showLoginForm = true;
    }
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async verifyEmailAddress() {
      let msg = 'Unknown error 88884';
      this.verificationMsg = '... verifying email address ...';
      await AuthManagement.create({
        action: "verifySignupLong",
        value: this.token,
        notifierOptions: {},
      }).then(() => {
        this.loggedInUser.user.isVerified = true;
        msg = true;
      }).catch((e) => {
        if (e.message === 'User not found.') {
          msg = 'Verification code either already used or expired.'
        } else {
          msg = e.message;
        }
      });
      return msg;
    },
    async upgradeAccount(activeUser) {
      if (activeUser.tier === SubscriptionTypeMap.unverified && activeUser.isVerified === true) {
        this.verificationMsg = '... upgrading account details ...';
        this.accountEvent.event = AccountEventTypeMap.startSoloSubscriptionFromUnverified;
        this.accountEvent.userId = activeUser._id;
        this.accountEvent.createdAt = Date.now();
        this.accountEvent.note = "used feathersjs-auth-mgmt trigger on new account verification";
        this.accountEvent.detail = {
          subscription: SubscriptionTypeMap.solo,
          term: SubscriptionTermTypeMap.monthly,
          currentSubscription: SubscriptionTypeMap.unverified,
        };
        this.accountEvent.create()
          .then(() => {
            this.$router
              .push({name: 'ChooseTier', query: { psu: true }}) // when here, a new user is verifying the first email
              .then(() => {
                this.$router.go()
              }) // this forces a refresh on destination
          })
          .catch((e) => {
            this.showSnacker = true;
            console.log(`err: ${e.message}`);
            this.snackerMsg = `Internal error upgrading to initial Solo tier`;
          })
      } else {
        this.verificationMsg = '... account already verified so redirecting home ...';
        this.$router
          .push({ name: 'Models', params: { slug: this.loggedInUser.user.username }}) // when here, an old user is verifying a new email
          .then(() => { this.$router.go() }) // this forces a refresh on destination
      }
    },
    async login() {
      if ( this.isValid ) {
        this.verificationMsg = '... logging in ...';
        this.authenticate({
          strategy: 'local',
          ...this.user,
        }).then(async (result) => {
          const vResult = await this.verifyEmailAddress();
          if (vResult === true) {
            await this.upgradeAccount(result.user);
          } else {
            this.showSnacker = true;
            this.snackerMsg = vResult;
            this.verificationMsg = vResult;
          }
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
