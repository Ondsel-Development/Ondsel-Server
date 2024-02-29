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
        dot-color="orange"
      >
        <v-card-title><i>Download / Explore</i></v-card-title>
        <v-card-subtitle>recommend downloading Ondsel SE next</v-card-subtitle>
      </v-timeline-item>
    </v-timeline>
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Download and Explore!</v-card-title>
      <v-card-text>

        <v-card>
          <v-card-title>Ondsel ES downloads</v-card-title>
          <v-card-subtitle>v 2024.1.0</v-card-subtitle>
          <v-card-text>
            <v-row class="mt-4">
              <v-col cols="5" class="d-flex justify-end">
                <v-avatar size="10em" rounded="0" class="pa-4 text-end">
                  <v-img
                    width="8em"
                    alt="Linux"
                    src="https://ondsel.com/img/os_linux.svg"
                  />
                </v-avatar>
              </v-col>
              <v-col cols="6" style="border-left: 8px solid black;">
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none"
                >
                  aarch.AppImage
                </v-btn>
                <p/>
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none mt-6"
                >
                  aarch.AppImage
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="5" class="d-flex justify-end">
                <v-avatar size="10em" rounded="0">
                  <v-img
                    alt="Mac"
                    src="https://ondsel.com/img/os_mac.svg"
                  />
                </v-avatar>
              </v-col>
              <v-col cols="6" style="border-left: 8px solid black;">
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none"
                >
                  x
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="5" class="d-flex justify-end">
                <v-avatar size="10em" rounded="0">
                  <v-img
                    alt="Windows"
                    src="https://ondsel.com/img/os_windows.svg"
                  />
                </v-avatar>
              </v-col>
              <v-col cols="6" style="border-left: 8px solid black;">
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none"
                >
                  x
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>


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
