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
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Full 3D CAD design suite for the desktop</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Upload up to 1GB to the online vault. open models only</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Version history</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Multiple open workspaces</v-list-item>
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
                       @click="goHome"
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
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Everything in Solo</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Upload up to 10GB to the online vault. 100 compute minutes</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Open organizations for team management</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Private workspaces and models for personal work</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Control what viewers can download from the vault</v-list-item>
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
                       @click="goHome"
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
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Everything in Peer</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Upload up to 50GB to the online vault. 500 compute minutes</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Private and open organizations for team management</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-check-outline"/>&nbsp;</template>Organization workspaces</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-clock-outline"/>&nbsp;</template>Outside collaborators</v-list-item>
                  <v-list-item><template v-slot:prepend><v-icon icon="mdi-clock-outline"/>&nbsp;</template>Ability to run custom scripts</v-list-item>
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
                  COMING SOON
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
      this.$router.push({name: 'Models', params: {slug: this.loggedInUser.user.username}})
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
