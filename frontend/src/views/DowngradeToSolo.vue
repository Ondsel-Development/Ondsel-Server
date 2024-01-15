<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="800" flat>
      <v-card-title>Downgrade to Solo Complete</v-card-title>
      <v-card-text>
        <div v-if="transactionRecorded">
          <p>
            Your account is now setup for automatically downgrading to Solo service at the end of the current billing period. Until then, enjoy the remainder of your current service.
          </p>
          &nbsp;
          <p>
            Click on "Continue" below to refresh your browser's cache.
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
        <v-btn v-if="transactionRecorded">
          <a href="/">continue</a>
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
  name: 'DowngradeToSolo',
  data() {
    return {
      result: {},
      accountEvent: new models.api.AccountEvent(),
      transactionRecorded: false,
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
    async goHome() {
      this.$router.push({name: 'Models', params: {slug: this.loggedInUser.user.username}})
    },
    async applySubscription() {
      this.accountEvent.event = AccountEventTypeMap.subscriptionTierDowngrade;
      this.accountEvent.detail.subscription = SubscriptionTypeMap.solo;
      this.accountEvent.detail.currentSubscription = this.loggedInUser.user.tier;
      this.accountEvent.detail.term = SubscriptionTermTypeMap.monthly;
      this.accountEvent.amount = 0; // $0
      this.accountEvent.originalCurrency = 'USD';
      this.accountEvent.originalAmt = '0.00';
      this.accountEvent.note = 'frontend DowngradeToSolo page call';
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
