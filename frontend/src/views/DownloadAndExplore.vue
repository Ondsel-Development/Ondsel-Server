<template>
  <v-container fluid class="fill-height">
    <v-timeline v-if="postSignUp" direction="horizontal">
      <v-timeline-item
        dot-color="green"
      >
        <v-card-title>Sign Up</v-card-title>
        <v-card-subtitle>complete</v-card-subtitle>
      </v-timeline-item>
      <v-timeline-item
        dot-color="green"
      >
        <v-card-title>Verify Email</v-card-title>
        <v-card-subtitle>complete</v-card-subtitle>
      </v-timeline-item>
      <v-timeline-item
        dot-color="green"
      >
        <v-card-title>Choose Tier</v-card-title>
        <v-card-subtitle>complete</v-card-subtitle>
      </v-timeline-item>
      <v-timeline-item
        dot-color="blue"
      >
        <v-card-title><i>Download / Explore</i></v-card-title>
        <v-card-subtitle>recommend downloading Ondsel SE next</v-card-subtitle>
      </v-timeline-item>
    </v-timeline>
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Download and Explore!</v-card-title>
      <v-card-text>
        download links and intro stuff go here
        <p>
          You can always get back to this page from the right-hand app-bar menu
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'DownloadAndExplore',
  data() {
    return {
      postSignUp: false,
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  async created() {
    if (this.loggedInUser.user.tier === SubscriptionTypeMap.unverified) {
      await this.goHome();
    }
    this.postSignUp = this.$route.query.psu;
  },
  methods: {
    async goHome() {
      this.$router.push({name: 'LensHome'})
    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'DownloadAndExplore') {
        this.postSignUp = this.$route.query.psu;
      }
    }
  }
}
</script>

<style scoped>

</style>
