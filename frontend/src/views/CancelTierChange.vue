<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="800" flat>
      <v-card-title>Account Tier Change Cancelled</v-card-title>
      <v-card-text>
        <div v-if="transactionRecorded">
          <p>
            Your account is no longer switching service level (tier) at the end of the current billing period.
          </p>
          &nbsp;
          <p>
            Please Login again to see your new credentials.
          </p>
        </div>
        <div v-else>
          <p>
            For some reason, Ondsel's system had difficulty recording the transaction. Please hit the "try recording again" button below to re-attempt.
          </p>
          &nbsp;
          <p>
            If this continues to fail, please contact <a href="mailto:contact@ondsel.com">contact@ondsel.com</a> for support.
          </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="transactionRecorded"
               @click="goLogin"
        >
          Go To Login Page
        </v-btn>
        <v-btn v-else
               @click="applySubscription"
        >
          try recording again
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>

import {mapActions, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {AccountEventTypeMap} from "@/store/services/accountEvent";
import {SubscriptionTermTypeMap, SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'CancelTierChange',
  data() {
    return {
      result: {},
      accountEvent: new models.api.AccountEvent(),
      user: {
        email: '',
        password: '',
        tier: '',
      },
      transactionRecorded: false,
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
    ...mapActions('auth', {authLogout: 'logout'}),
    async goLogin() {
      this.$router.push({name: 'Login'})
    },
    async applySubscription() {
      this.accountEvent.event = AccountEventTypeMap.cancelTierDowngrade;
      this.accountEvent.detail.subscription = this.loggedInUser.user.tier;
      this.accountEvent.detail.currentSubscription = this.loggedInUser.user.tier;
      this.accountEvent.detail.term = SubscriptionTermTypeMap.yearly; // TODO: this is a hack for now.
      this.accountEvent.amount = 0; // $0
      this.accountEvent.originalCurrency = 'USD';
      this.accountEvent.originalAmt = '0.00';
      this.accountEvent.note = 'frontend CancelTierChange page call';
      await this.accountEvent.create()
        .then(() => {
          this.transactionRecorded = true;
          this.authLogout().then(() => {
            console.log("logged out");
          }).catch((e) => {
            console.log(e);
            console.log(e.message);
          })
        })
        .catch((e) => {
          console.log(e);
          console.log(e.message);
        });
    }
  },
  created() {
    console.log("creation here");
    this.applySubscription();
  }
}
</script>

<style scoped>

</style>
