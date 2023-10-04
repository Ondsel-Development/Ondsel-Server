<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" :subtitle="`current tier: ${user.fullTierName}`" width="896" flat>
      <v-card-title>Select Subscription Tier</v-card-title>
      <v-container>
        <v-row align="stretch">
          <v-col cols="4">
            <v-card class="fill-height d-flex flex-column"  variant="tonal">
              <v-card-title>Solo</v-card-title>
              <v-card-subtitle v-if="loggedInUser.user.tier === SubscriptionTypeMap.solo">current</v-card-subtitle>
              <v-card-subtitle v-else>&nbsp;</v-card-subtitle>
              <v-card-text>
                <v-list>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Full FreeCAD Application</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Local Workspaces</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>50 models (public only)</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Version History</v-list-item>
                </v-list>
              </v-card-text>
              <v-spacer></v-spacer>
              <v-card-actions>
                <v-btn v-if="user.tier !== SubscriptionTypeMap.solo && user.nextTier !== SubscriptionTypeMap.solo"
                       variant="text"
                       @click="downgradeToSolo"
                >
                  Downgrade to Solo ($0/mo)
                </v-btn>
                <v-btn v-else-if="user.nextTier=== SubscriptionTypeMap.solo"
                       variant="text"
                       @click="cancelDowngrade"
                >
                  Cancel Switch to Solo
                </v-btn>
                <v-btn v-else
                       variant="text"
                       @click="goAccountSettings"
                >
                  Continue
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="fill-height d-flex flex-column" variant="tonal">
              <v-card-title>Peer</v-card-title>
              <v-card-subtitle v-if="loggedInUser.user.tier === SubscriptionTypeMap.peer">current</v-card-subtitle>
              <v-card-subtitle v-else>&nbsp;</v-card-subtitle>
              <v-card-text>
                <v-list>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Everything in Solo</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>250 models</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Private models</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Customizable models</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Control what the viewer can download</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Equivalent to $10/month</v-list-item>
                </v-list>
              </v-card-text>
              <v-spacer></v-spacer>
              <v-card-actions>
                <v-btn v-if="loggedInUser.nextTier=== SubscriptionTypeMap.peer"
                       variant="text"
                >
                  Cancel the Switch to Peer
                </v-btn>
                <v-btn v-else-if="loggedInUser.user.tier !== SubscriptionTypeMap.peer"
                       variant="text"
                       :href="`${stripePurchasePeerUrl}?prefilled_email=${encodeURIComponent(loggedInUser.user.email)}&utm_content=${loggedInUser.user._id}`"
                >
                  Switch to Peer ($120/yr)
                </v-btn>
                <v-btn v-else
                       variant="text"
                       @click="goAccountSettings"
                >
                  Continue
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="fill-height d-flex flex-column" variant="tonal">
              <v-card-title>Enterprise</v-card-title>
              <v-card-subtitle v-if="loggedInUser.user.tier === SubscriptionTypeMap.enterprise">current</v-card-subtitle>
              <v-card-subtitle v-else>&nbsp;</v-card-subtitle>
              <v-card-text>
                <v-list>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Everything in Peer</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Organization Workspaces</v-list-item>
                </v-list>
              </v-card-text>
              <v-spacer></v-spacer>
              <v-card-actions>
                <v-btn v-if="loggedInUser.nextTier === SubscriptionTypeMap.enterprise"
                       variant="text"
                       disabled
                >
                  Cancel the Switch to Enterprise
                </v-btn>
                <v-btn v-else-if="loggedInUser.user.tier !== SubscriptionTypeMap.enterprise"
                       variant="text"
                       disabled
                >
                  NOT AVAILABLE YET
                </v-btn>
                <v-btn v-else
                       variant="text"
                       @click="goHome"
                >
                  Continue
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'ChooseTier',
  data() {
    return {
      result: {},
      stripePurchasePeerUrl: import.meta.env.VITE_STRIPE_PURCHASE_PEER_URL,
    }
  },
  computed: {
    SubscriptionTypeMap() {
      return SubscriptionTypeMap
    },
    User: () => models.api.User,
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  async created() {
    if (this.loggedInUser.user.tier === SubscriptionTypeMap.unverified) {
      await this.goHome();
    }
  },
  methods: {
    async goHome() {
      this.$router.push({name: 'Models'})
    },
    async downgradeToSolo() {
      this.$router.push({name: 'DowngradeToSolo'})
    },
    async cancelDowngrade() {
      this.$router.push({name: 'CancelTierChange'})
    },
  }
}
</script>

<style scoped>

</style>
