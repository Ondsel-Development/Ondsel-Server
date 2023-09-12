<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" :subtitle="`email: ${user.email}`" width="896" flat>
      <v-card-title>Verify Email for Signup</v-card-title>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'VerifySignup',
  data() {
    return {
      result: {},
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
