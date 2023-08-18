<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="800" flat>
      <v-card-title>Payment Complete</v-card-title>
      <v-card-text>
        Yeppers.
        {{ this.$route.params }}
        {{ this.$route.query }}
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="transactionRecorded == true"
               @click="goHome"
        >
          Continue
        </v-btn>
        <v-btn v-else
               @click="applySubscription"
        >
          DO IT
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {AccountEventTypeMap} from "@/store/services/accountEvent";
import {SubscriptionTypeMap} from "@/store/services/users";

//
// This page is ONLY reached via a return call from a Stripe Purchase Page.
// Literally, the user is redirected back to this page with limited details.
//

export default {
  name: 'InitialPurchaseForPeer',
  data() {
    return {
      result: {},
      accountEvent: new models.api.AccountEvent(),
      user: {
        email: '',
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
    async goHome() {
      this.$router.push({name: 'Models'})
    },
    async applySubscription() {
      this.accountEvent.event = AccountEventTypeMap.initialSubscriptionPurchase;
      this.accountEvent.detail.subscription = SubscriptionTypeMap.premium;
      this.accountEvent.detail.currentSubscription = this.loggedInUser.user.tier;
      this.accountEvent.detail.term = '1 month';
      this.accountEvent.amount = 1000; // $10.00
      this.accountEvent.originalCurrency = 'USD';
      this.accountEvent.originalAmt = '10.00';
      this.accountEvent.note = 'frontend InitialPurchaseForPeer page call';
      await this.accountEvent.create()
        .then(() => {
          this.transactionRecorded = true;
        })
        .catch((e) => {
          console.log(e);
          console.log(e.message);
        });
    }
  }
}
</script>

<style scoped>

</style>
