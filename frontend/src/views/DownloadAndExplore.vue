<template>
  <v-container class="d-flex flex-wrap">
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

    <v-card flat>
      <v-card-title>Download</v-card-title>
      <v-card-text>
        <v-card>
          <v-card-title>Ondsel ES</v-card-title>
          <v-card-subtitle>v 2024.1.0</v-card-subtitle>
          <v-card-text>
            <v-container class="d-flex flex-row">
              <v-container max-width="10em" class="d-flex justify-end">
                <v-avatar width="9em" rounded="0">
                  <v-img
                    width="8em"
                    alt="Linux"
                    src="https://ondsel.com/img/os_linux.svg"
                  />
                </v-avatar>
              </v-container>
              <v-container style="border-left: 4px solid black;">
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none justify-start"
                  min-width="16em"
                  href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-Linux-aarch64.AppImage"
                >
                  aarch.AppImage
                </v-btn>
                <v-btn href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-Linux-aarch64.AppImage-SHA256.txt" flat size="x-small" class="text-caption text-red">SHA256</v-btn>
                <p/>
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none justify-start mt-6"
                  min-width="16em"
                  href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-Linux-x86_64.AppImage"
                >
                  x86_64.AppImage
                </v-btn>
                <v-btn href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-Linux-x86_64.AppImage-SHA256.txt" flat size="x-small" class="text-caption text-red">SHA256</v-btn>
              </v-container>
            </v-container>
            <p/>
            <v-container class="d-flex flex-row">
              <v-container max-width="10em" class="d-flex justify-end">
                <v-avatar width="9em" rounded="0">
                  <v-img
                    width="8em"
                    alt="Mac"
                    src="https://ondsel.com/img/os_mac.svg"
                  />
                </v-avatar>
              </v-container>
              <v-container style="border-left: 4px solid black;">
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none justify-start"
                  min-width="16em"
                  href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-macOS-apple-silicon-arm64.dmg"
                >
                  arm64.dmg
                </v-btn>
                <v-btn href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-macOS-apple-silicon-arm64.dmg-SHA256.txt" flat size="x-small" class="text-caption text-red">SHA256</v-btn>
                <p/>
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none justify-start mt-6"
                  min-width="16em"
                  href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-macOS-intel-x86_64.dmg"
                >
                  x86_64.dmg
                </v-btn>
                <v-btn href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-macOS-intel-x86_64.dmg-SHA256.txt" flat size="x-small" class="text-caption text-red">SHA256</v-btn>
              </v-container>
            </v-container>
            <v-container class="d-flex flex-row mt-4">
              <v-container width="10em" class="d-flex justify-end">
                <v-avatar width="9em" rounded="0">
                  <v-img
                    width="8em"
                    alt="Windows"
                    src="https://ondsel.com/img/os_windows.svg"
                  />
                </v-avatar>
              </v-container>
              <v-container style="border-left: 4px solid black;">
                <v-btn
                  prepend-icon="mdi-download-box"
                  size="large"
                  variant="outlined"
                  class="text-none justify-start mt-4"
                  min-width="16em"
                  href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-Windows-x86_64.7z"
                >
                  x86_64.7z
                </v-btn>
                <v-btn href="https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.1.0/Ondsel_ES_2024.1.0.35694-Windows-x86_64.7z-SHA256.txt" flat size="x-small" class="text-caption text-red">SHA256</v-btn>
              </v-container>
            </v-container>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-card flat>
      <v-card-title>Explore</v-card-title>
      <v-card-text>
        <v-card class="mt-12">
          <v-card-title>Links</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item @click-once="goPublicModels()">
                <v-list-item-title>Public CAD Models</v-list-item-title>
                <v-list-item-subtitle>Browse the models made public by other users and organizations.</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-card flat>
      <v-card-text>
        <i>You can always get back to this page from the right-hand app-bar menu.</i>
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
    async goPublicModels() {
      this.$router.push({name: 'PublicModels'})
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
