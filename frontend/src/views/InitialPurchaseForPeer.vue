<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="800" flat>
      <v-card-title>Payment Complete</v-card-title>
      <v-card-text>
        <div v-if="transactionRecorded">
          <p>
            <b>Congratulations!</b> Your account is now setup for Peer service.
          </p>
          &nbsp;
          <p>
            Click on "Continue" below to refresh your browser's cache.
          </p>
        </div>
        <div v-else>
          <p>
            For some reason, the transaction finished, but Ondsel's system had difficulty recording the transaction. Please hit the "try recording again" button below to re-attempt.
          </p>
          &nbsp;
          <p>
            If this continues to fail, please contact <a href="mailto:contact@ondsel.com">contact@ondsel.com</a> for support.
          </p>
          &nbsp;
          <p>
            details:
            <br/>
            {{ this.$route.params }}
            <br/>
            {{ this.$route.query }}
          </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="transactionRecorded">
          <v-btn v-if="transactionRecorded">
            <a href="/">continue</a>
          </v-btn>
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
    async applySubscription() {
      this.accountEvent.event = AccountEventTypeMap.initialSubscriptionPurchase;
      this.accountEvent.detail.subscription = SubscriptionTypeMap.peer;
      this.accountEvent.detail.currentSubscription = this.loggedInUser.user.tier;
      this.accountEvent.detail.term = SubscriptionTermTypeMap.yearly;
      this.accountEvent.amount = 12000; // $120.00
      this.accountEvent.originalCurrency = 'USD';
      this.accountEvent.originalAmt = '120.00';
      this.accountEvent.note = 'frontend InitialPurchaseForPeer page call';
      this.accountEvent.additionalData = {
        ...this.$route.params,
        ...this.$route.query,
      };
      await this.accountEvent.create()
        .then(() => {
          this.transactionRecorded = true;
        })
        .catch((e) => {
          console.log(e);
          console.log(e.message);
        });
    }
  },
  created() {
    this.applySubscription();
  }
}
</script>

<style scoped>

</style>
