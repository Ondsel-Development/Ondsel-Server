<template>
  <v-container class="d-flex flex-column justify-center">
    <signup-progress-bar step="3" msg="recommend downloading Ondsel SE next"></signup-progress-bar>
    <v-container class="d-flex flex-wrap justify-center">
      <v-card flat>
        <v-card-title>Download</v-card-title>
        <v-card-text>
          <v-card width="30em">
            <v-card-title>Ondsel ES</v-card-title>
            <v-card-subtitle>v {{ondselSeVersionTxt}}</v-card-subtitle>
            <v-card-text class="overflow-y-auto" >
              <v-container class="d-flex flex-row justify-start">
                <v-avatar width="7em" rounded="0" class="mr-2">
                  <v-img
                    width="6em"
                    alt="Linux"
                    src="https://ondsel.com/img/os_linux.svg"
                  />
                </v-avatar>
                <v-container style="border-left: 4px solid black;">
                  <v-btn
                    size="large"
                    variant="outlined"
                    class="text-none justify-start mt-6"
                    min-width="14em"
                    :href="ondselSeDownload['Linux-x86_64.AppImage']?.browser_download_url"
                  >
                    x86_64 AppImage
                  </v-btn>
                  <v-btn
                    :href="ondselSeDownload['Linux-x86_64.AppImage-SHA256.txt']?.browser_download_url"
                    flat
                    size="x-small"
                    class="text-caption text-red"
                  >SHA256</v-btn>
                  <p/>
                  <v-btn
                    size="large"
                    variant="outlined"
                    class="text-none justify-start"
                    min-width="14em"
                    :href="ondselSeDownload['Linux-aarch64.AppImage']?.browser_download_url"
                  >
                    aarch64 AppImage
                  </v-btn>
                  <v-btn
                    :href="ondselSeDownload['Linux-aarch64.AppImage-SHA256.txt']?.browser_download_url"
                    flat
                    size="x-small"
                    class="text-caption text-red"
                  >SHA256</v-btn>
                </v-container>
              </v-container>
              <p/>
              <v-container class="d-flex flex-row justify-start">
                <v-avatar width="7em" rounded="0" class="mr-2">
                  <v-img
                    width="6em"
                    alt="Mac"
                    src="https://ondsel.com/img/os_mac.svg"
                  />
                </v-avatar>
                <v-container style="border-left: 4px solid black;">
                  <v-btn
                    size="large"
                    variant="outlined"
                    class="text-none justify-start"
                    min-width="14em"
                    :href="ondselSeDownload['macOS-apple-silicon-arm64.dmg']?.browser_download_url"
                  >
                    Apple Silicon dmg
                  </v-btn>
                  <v-btn
                    :href="ondselSeDownload['macOS-apple-silicon-arm64.dmg-SHA256.txt']?.browser_download_url"
                    flat
                    size="x-small"
                    class="text-caption text-red"
                  >SHA256</v-btn>
                  <p/>
                  <v-btn
                    size="large"
                    variant="outlined"
                    class="text-none justify-start mt-6"
                    min-width="14em"
                    :href="ondselSeDownload['macOS-intel-x86_64.dmg']?.browser_download_url"
                  >
                    Intel dmg
                  </v-btn>
                  <v-btn
                    :href="ondselSeDownload['macOS-intel-x86_64.dmg-SHA256.txt']?.browser_download_url"
                    flat
                    size="x-small"
                    class="text-caption text-red"
                  >SHA256</v-btn>
                </v-container>
              </v-container>
              <v-container class="d-flex flex-row mt-4 justify-start">
                <v-avatar width="7em" rounded="0" class="mr-2">
                  <v-img
                    width="6em"
                    alt="Windows"
                    src="https://ondsel.com/img/os_windows.svg"
                  />
                </v-avatar>
                <v-container style="border-left: 4px solid black;">
                  <v-btn
                    size="large"
                    variant="outlined"
                    class="text-none justify-start mt-4"
                    min-width="14em"
                    :href="ondselSeDownload['Windows-x86_64-installer.exe']?.browser_download_url"
                  >
                    x86_64 installer
                  </v-btn>
                  <v-btn
                    :href="ondselSeDownload['Windows-x86_64-installer.exe-SHA256.txt']?.browser_download_url"
                    flat
                    size="x-small"
                    class="text-caption text-red"
                  >SHA256</v-btn>
                </v-container>
              </v-container>
            </v-card-text>
          </v-card>

          <v-card class="mt-4" width="30em">
            <v-card-title>Pre-Releases</v-card-title>
            <v-card-text class="overflow-y-auto" >
              <b>The latest pre-release version of Ondsel ES was built on {{weeklyBuildDate}}</b>
              <p>
                ⚠️ These are intended for testing purposes only. Please don't use them for regular work. ⚠️
              </p>
              <v-container class="d-flex flex-row justify-start">
                <v-avatar width="7em" rounded="0" class="mr-2">
                  <v-img
                    width="6em"
                    alt="Linux"
                    src="https://ondsel.com/img/os_linux.svg"
                  />
                </v-avatar>
                <v-container style="border-left: 4px solid black;">
                  <v-expansion-panels>
                    <v-expansion-panel title="for testing">
                      <v-expansion-panel-text>
                        <v-btn
                          size="large"
                          variant="outlined"
                          class="text-none justify-start mt-6"
                          min-width="14em"
                          :href="weeklyDownload['Linux-x86_64.AppImage']?.browser_download_url"
                        >
                          <span>
                            x86_64 AppImage
                            <span
                              class="text-sm-caption"
                            ><br>{{dateFormat(weeklyDownload['Linux-x86_64.AppImage']?.releaseDate)}}</span>
                          </span>
                        </v-btn>
                        <p/>
                        <v-btn
                          size="large"
                          variant="outlined"
                          class="text-none justify-start mt-6"
                          min-width="14em"
                          :href="weeklyDownload['Linux-aarch64.AppImage']?.browser_download_url"
                        >
                          <span>
                            aarch64 AppImage
                            <span
                              class="text-sm-caption"
                            ><br>{{dateFormat(weeklyDownload['Linux-aarch64.AppImage']?.releaseDate)}}</span>
                          </span>
                        </v-btn>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-container>
              </v-container>
              <p/>
              <v-container class="d-flex flex-row justify-start">
                <v-avatar width="7em" rounded="0" class="mr-2">
                  <v-img
                    width="6em"
                    alt="Mac"
                    src="https://ondsel.com/img/os_mac.svg"
                  />
                </v-avatar>
                <v-container style="border-left: 4px solid black;">
                  <v-expansion-panels>
                    <v-expansion-panel title="for testing">
                      <v-expansion-panel-text>
                        <v-btn
                          size="large"
                          variant="outlined"
                          class="text-none justify-start"
                          min-width="14em"
                          :href="weeklyDownload['macOS-apple-silicon-arm64.dmg']?.browser_download_url"
                        >
                          <span>
                            Apple Silicon dmg
                            <span
                              class="text-sm-caption"
                            ><br>{{dateFormat(weeklyDownload['macOS-apple-silicon-arm64.dmg']?.releaseDate)}}</span>
                          </span>
                        </v-btn>
                        <p/>
                        <v-btn
                          size="large"
                          variant="outlined"
                          class="text-none justify-start mt-6"
                          min-width="14em"
                          :href="weeklyDownload['macOS-intel-x86_64.dmg']?.browser_download_url"
                        >
                          <span>
                            Intel dmg
                            <span
                              class="text-sm-caption"
                            ><br>{{dateFormat(weeklyDownload['macOS-intel-x86_64.dmg']?.releaseDate)}}</span>
                          </span>
                        </v-btn>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-container>
              </v-container>
              <v-container class="d-flex flex-row justify-start mt-4">
                <v-avatar width="7em" rounded="0" class="mr-2">
                  <v-img
                    width="6em"
                    alt="Windows"
                    src="https://ondsel.com/img/os_windows.svg"
                  />
                </v-avatar>
                <v-container style="border-left: 4px solid black;">
                  <v-expansion-panels>
                    <v-expansion-panel title="for testing">
                      <v-expansion-panel-text>
                        <v-btn
                          size="large"
                          variant="outlined"
                          class="text-none justify-start mt-4"
                          min-width="14em"
                          :href="weeklyDownload['Windows-x86_64.7z']?.browser_download_url"
                        >
                          <span>
                            x86_64.7z
                            <span
                              class="text-sm-caption"
                            ><br>{{dateFormat(weeklyDownload['Windows-x86_64.7z']?.releaseDate)}}</span>
                          </span>
                        </v-btn>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
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
                <v-list-item @click-once="goPublicModels()" color="link">
                  <v-list-item-title>Public CAD Models</v-list-item-title>
                  <v-list-item-subtitle>Browse the models made public by other users and organizations.</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-container>

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
import SignupProgressBar from "@/components/SignupProgressBar.vue";
import {models} from "@feathersjs/vuex";

const { Publisher } = models.api;

export default {
  name: 'DownloadAndExplore',
  components: {SignupProgressBar},
  data: () => ({
    ondselSeDownload: {},
    ondselSeVersionTxt: 'tbd',
    weeklyDownload: {},
    weeklyBuildDate: 'tbd',
    releaseFileTypes: [
      'Linux-x86_64.AppImage',
      'Linux-x86_64.AppImage-SHA256.txt',
      'Linux-aarch64.AppImage',
      'Linux-aarch64.AppImage-SHA256.txt',
      'macOS-apple-silicon-arm64.dmg',
      'macOS-apple-silicon-arm64.dmg-SHA256.txt',
      'macOS-intel-x86_64.dmg',
      'macOS-intel-x86_64.dmg-SHA256.txt',
      'Windows-x86_64-installer.exe',
      'Windows-x86_64-installer.exe-SHA256.txt',
    ],
    weeklyFileTypes: [
      'Linux-aarch64.AppImage',
      'Linux-x86_64.AppImage',
      'macOS-apple-silicon-arm64.dmg',
      'macOS-intel-x86_64.dmg',
      'Windows-x86_64.7z',
    ],
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  async created() {
    if (this.loggedInUser.user.tier === SubscriptionTypeMap.unverified) {
      this.$router.push({name: 'PendingVerification'})
    }
    let osVer = 'unknown';
    let buildDate = 'unknown';
    let osd = {};
    let wd = {};
    const results = await Publisher.find({query: {$limit: 100}});
    const publishedList = results.data;
    for (const item of publishedList) {
      const target = item.target;
      const cadence = item.releaseCadence;
      let url;
      if (import.meta.env.VITE_DEV_PROXY_TO_API_HACK) {
        url = `${import.meta.env.VITE_DEV_PROXY_TO_API_HACK}/publisher/${item._id}/download/${item.filename}`;
      } else {
        url = `/publisher/${item._id}/download/${item.filename}`;
      }
      if (cadence === 'stable') {
        osd[target] = item;
        osd[target].browser_download_url = url;
        osVer = item.release;
      } else {
        wd[target] = item;
        wd[target].browser_download_url = url;
        buildDate = this.dateFormat(item.releaseDate);
        console.log(item)
      }
    }
    console.log(buildDate)
    this.ondselSeDownload = osd;
    this.ondselSeVersionTxt = osVer;
    this.weeklyDownload = wd;
    this.weeklyBuildDate = buildDate;
  },
  methods: {
    async scanPublisherCollection() {
    },
    async goPublicModels() {
      this.$router.push({name: 'PublicModels'})
    },
    dateFormat(number) {
      if (number) {
        const date = new Date(number);
        return date.toDateString();
      }
      return "unknown"
    },
  },
}
</script>

<style scoped>

</style>
