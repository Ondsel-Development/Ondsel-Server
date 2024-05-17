<template>
  <v-container class="d-flex flex-column justify-center">
    <signup-progress-bar step="2" msg="choose below"></signup-progress-bar>
    <v-card class="mx-auto" :subtitle="`current tier: ${user.fullTierName}`" flat>
      <v-card-title>Select Subscription Tier</v-card-title>
      <v-container class="d-flex flex-wrap">
        <v-card class="ma-2 d-flex flex-column" width="22em" variant="tonal" @click="soloClicked()">
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
          <v-card-actions class="flex-column">
            <v-btn
              :color="soloOptions.color"
              variant="elevated"
            >{{soloOptions.text}}</v-btn>
            <p>&nbsp;</p>
          </v-card-actions>
        </v-card>
        <v-card class="ma-2 d-flex flex-column" width="22em" variant="tonal" @click="peerClicked()">
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
          <v-card-actions class="flex-column">
            <v-btn
              class="float-left"
              :color="peerOptions.color"
              variant="elevated"
            >{{peerOptions.text}}</v-btn>
            <p>** billed annually</p>
          </v-card-actions>
        </v-card>
        <v-card class="ma-2 d-flex flex-column" width="22em" variant="tonal" @click="enterpriseClicked()">
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
          <v-card-actions class="flex-column">
            <v-btn
              :color="enterpriseOptions.color"
              variant="elevated"
              disabled
            >{{enterpriseOptions.text}}</v-btn>
            <p>&nbsp;</p>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";
import SignupProgressBar from "@/components/SignupProgressBar.vue";

export default {
  name: 'ChooseTier',
  components: {SignupProgressBar},
  data() {
    return {
      result: {},
      stripePurchasePeerUrl: import.meta.env.VITE_STRIPE_PURCHASE_PEER_URL,
      postSignUp: false,
      soloOptions: {name: 'tbd', text: 'tbd', color: 'secondary'},
      peerOptions: {name: 'tbd', text: 'tbd', color: 'secondary'},
      enterpriseOptions: {name: 'tbd', text: 'tbd', color: 'cancel'},
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
      await this.goAway();
    }
    this.postSignUp = this.$route.query.psu;
    this.soloOptions = this.soloResponse();
    this.peerOptions = this.peerResponse();
    this.enterpriseOptions = this.enterpriseResponse();
  },
  methods: {
    async soloClicked() {
      switch(this.soloOptions.action) {
        case 'downgradeToSolo':
          this.$router.push({name: 'DowngradeToSolo'})
          break;
        case 'cancelDowngrade':
          this.$router.push({name: 'CancelTierChange'})
          break;
        case 'goAway':
          await this.goAway();
          break;
      }
    },
    async peerClicked() {
      switch(this.peerOptions.action) {
        case 'upgradeToPeer':
          this.$router.push({name: 'PaymentProcessorForPeerSubscription', params: {
            prefilled_email: encodeURIComponent(this.loggedInUser.user.email),
            utm_content: this.loggedInUser.user._id.toString(),
          }})
          break;
        case 'goAway':
          await this.goAway();
          break;
      }
    },
    async enterpriseClicked() {
      console.log("not available yet");
    },
    async goAway() {
      if (this.postSignUp) {
        this.$router.push({name: 'DownloadAndExplore', query: {psu: true}})
      } else {
        // the only other way to this page is via account settings; so go back there
        this.$router.push({name: 'AccountSettings', params: {slug: this.loggedInUser.user.username}})
      }
    },
    soloResponse() {
      if (this.user.tier !== SubscriptionTypeMap.solo && this.user.nextTier !== SubscriptionTypeMap.solo) {
        return {action: `downgradeToSolo`, text: `Downgrade to Solo ($0 / mo)`, color: 'secondary'}
      } else if (this.user.nextTier=== SubscriptionTypeMap.solo) {
        return {action: 'cancelDowngrade', text: 'Cancel Switch to Solo', color: 'success'}
      }
      return {action: 'goAway', text: 'Continue', color: 'primary'}
    },
    peerResponse() {
      if (this.loggedInUser.nextTier=== SubscriptionTypeMap.peer) {
        return {action: `tbd`, text: `Cancel the Switch to Peer`, color: 'success'}
      } else if (this.loggedInUser.user.tier !== SubscriptionTypeMap.peer) {
        return {action: 'upgradeToPeer', text: 'Switch to Peer ($10 / mo)**', color: 'success'}
      }
      return {action: 'goAway', text: 'Continue', color: 'primary'}
    },
    enterpriseResponse() {
      return {action: 'nothing', text: 'COMING SOON', color: 'cancel'}
    },
  }
}
</script>

<style scoped>

</style>
