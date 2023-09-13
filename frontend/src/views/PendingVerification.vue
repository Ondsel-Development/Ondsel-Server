<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Pending Verification</v-card-title>
      <v-card-text>
        <p>
          Check your email for a confirmation message.
        </p>
        <p>
          Once confirmed, your account will be active.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'PendingVerification',
  data() {
    return {
      result: {},
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
