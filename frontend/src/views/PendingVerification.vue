<template>
  <v-container fluid class="fill-height">
    <v-timeline direction="horizontal">
      <v-timeline-item
        dot-color="green"
      >
        <v-card-title>Sign Up</v-card-title>
        <v-card-subtitle>complete</v-card-subtitle>
      </v-timeline-item>
      <v-timeline-item
        dot-color="orange"
      >
        <v-card-title><i>Verify Email</i></v-card-title>
        <v-card-subtitle>link sent to your email</v-card-subtitle>
      </v-timeline-item>
      <v-timeline-item>
        <v-card-title>Choose Tier</v-card-title>
      </v-timeline-item>
      <v-timeline-item>
        <v-card-title>Download / Explore</v-card-title>
      </v-timeline-item>
    </v-timeline>
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Pending Verification</v-card-title>
      <v-card-text>
        <p>
          Check your email for a confirmation message.
        </p>
        <p>
          Once confirmed, your account will be active and you will be sent to the Choose Tier step.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";

export default {
  name: 'PendingVerification',
  data() {
    return {
      result: {},
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
