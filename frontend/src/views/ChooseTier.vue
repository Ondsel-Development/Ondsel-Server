<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" :subtitle="`current tier: ${loggedInUser.user.tier}`" width="800" flat>
      <v-card-title>Select Subscription Tier</v-card-title>
      <v-container>
        <v-row align="stretch">
          <v-col>
            <v-card class="fill-height d-flex flex-column"  variant="tonal">
              <v-card-title>Solo</v-card-title>
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
                <v-btn v-if="loggedInUser.user.tier !== 'Free' && loggedInUser.nextTier !=='Free'"
                       variant="text"
                >
                  <!-- @click="reserve" -->
                  Switch to Solo on next renewal ($0/mo)
                </v-btn>
                <v-btn v-else-if="loggedInUser.nextTier==='Free'"
                       variant="text"
                >
                  <!-- @click="reserve" -->
                  Switch to Solo on next renewal ($0/mo)
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
          <v-col>
            <v-card class="fill-height d-flex flex-column" variant="tonal">
              <v-card-title>Peer</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Everything in Solo</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>250 models</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Private models</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Customizable models</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Control what the viewer can download</v-list-item>
                </v-list>
              </v-card-text>
              <v-spacer></v-spacer>
              <v-card-actions>
                <v-btn v-if="loggedInUser.user.tier !== 'Premium'"
                       variant="text"
                       href="https://google.com/"
                >
                  Switch to Peer ($10/mo)
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
          <v-col>
            <v-card class="fill-height d-flex flex-column" variant="tonal">
              <v-card-title>Enterprise</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Everything in Peer</v-list-item>
                  <v-list-item><template v-slot:prepend>*&nbsp;</template>Organization Workspaces</v-list-item>
                </v-list>
              </v-card-text>
              <v-spacer></v-spacer>
              <v-card-actions>
                <v-btn
                  variant="text"
                  disabled
                >
                  not available yet
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

export default {
  name: 'ChooseTier',
  data() {
    return {
      result: {},
      user: {
        email: '',
        tier: '',
      }
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
    async goHome() {
      this.$router.push({name: 'Models'})
    }
  }
}
</script>

<style scoped>

</style>
