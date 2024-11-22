<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div>getting started redirector</div>
</template>

<script>
import {mapState} from 'vuex';
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'GettingStarted',
  data: () => ({
    dialog: true,
  }),
  mounted() {
  },
  async created() {
    if (this.loggedInUser) {
      if (this.loggedInUser.user.tier === SubscriptionTypeMap.unverified) {
        this.$router.push({name: 'PendingVerification'})
      }
      this.$router.push({name: 'DownloadAndExplore'});
    } else {
      this.$router.push({name: 'SignUp'});
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
