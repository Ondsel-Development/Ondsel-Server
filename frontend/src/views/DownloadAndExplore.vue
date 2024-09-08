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
                              v-if="weeklyBuildDate !== weeklyDownload['Linux-x86_64.AppImage']?.created_at.slice(0, 10)"
                            ><br>{{weeklyDownload['Linux-x86_64.AppImage']?.created_at.slice(0, 10)}}</span>
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
                              v-if="weeklyBuildDate !== weeklyDownload['Linux-aarch64.AppImage']?.created_at.slice(0, 10)"
                            ><br>{{weeklyDownload['Linux-aarch64.AppImage']?.created_at.slice(0, 10)}}</span>
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
                              v-if="weeklyBuildDate !== weeklyDownload['macOS-apple-silicon-arm64.dmg']?.created_at.slice(0, 10)"
                            ><br>{{weeklyDownload['macOS-apple-silicon-arm64.dmg']?.created_at.slice(0, 10)}}</span>
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
                              v-if="weeklyBuildDate !== weeklyDownload['macOS-intel-x86_64.dmg']?.created_at.slice(0, 10)"
                            ><br>{{weeklyDownload['macOS-intel-x86_64.dmg']?.created_at.slice(0, 10)}}</span>
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
                              v-if="weeklyBuildDate !== weeklyDownload['Windows-x86_64.7z']?.created_at.slice(0, 10)"
                            ><br>{{weeklyDownload['Windows-x86_64.7z']?.created_at.slice(0, 10)}}</span>
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
    const results = await Publisher.find({});
    const publishedList = results.data;
    for (const item of publishedList) {
      const target = item.target;
      const cadence = item.releaseCadence;
      if (cadence === 'stable') {
        osd[target] = item;
        osd[target].browser_download_url = `/published/${item._id}/${item.filename}`;
        console.log(target);
        console.log(item);
        osVer = item.release;
      } else {
        wd[target] = item;
        buildDate = item.releaseDate;
      }
    }
    // await axios.get('https://api.github.com/repos/Ondsel-Development/FreeCAD/releases')
    //   .then(function (response) {
    //     const justCurrent = response.data.filter(build => build.prerelease !== true);
    //     const tagsFound = justCurrent.map(build => build.tag_name);
    //     const semverExp = new RegExp('^\\d{4}.'); // must start with four digits and a dot
    //     let semverTags = tagsFound.filter(tag => semverExp.test(tag));
    //     semverTags.sort();
    //     osVer = semverTags.pop();
    //     const ondselSeBuild = response.data.find(build => build.tag_name === osVer);
    //     let assets = ondselSeBuild.assets || []
    //     osd['Linux-aarch64.AppImage'] = assets.find(asset => asset.name.endsWith('Linux-aarch64.AppImage'));
    //     osd['Linux-aarch64.AppImage-SHA256.txt'] = assets.find(asset => asset.name.endsWith('Linux-aarch64.AppImage-SHA256.txt'));
    //     osd['Linux-x86_64.AppImage'] = assets.find(asset => asset.name.endsWith('Linux-x86_64.AppImage'));
    //     osd['Linux-x86_64.AppImage-SHA256.txt'] = assets.find(asset => asset.name.endsWith('Linux-x86_64.AppImage-SHA256.txt'));
    //     osd['macOS-apple-silicon-arm64.dmg'] = assets.find(asset => asset.name.endsWith('macOS-apple-silicon-arm64.dmg'));
    //     osd['macOS-apple-silicon-arm64.dmg-SHA256.txt'] = assets.find(asset => asset.name.endsWith('macOS-apple-silicon-arm64.dmg-SHA256.txt'));
    //     osd['macOS-intel-x86_64.dmg'] = assets.find(asset => asset.name.endsWith('macOS-intel-x86_64.dmg'));
    //     osd['macOS-intel-x86_64.dmg-SHA256.txt'] = assets.find(asset => asset.name.endsWith('macOS-intel-x86_64.dmg-SHA256.txt'));
    //     osd['Windows-x86_64-installer.exe'] = assets.find(asset => asset.name.endsWith('Windows-x86_64-installer.exe'));
    //     osd['Windows-x86_64-installer.exe-SHA256.txt'] = assets.find(asset => asset.name.endsWith('Windows-x86_64-installer.exe-SHA256.txt'));
    //     const testingBuild = response.data.find(build => build.tag_name === 'weekly-builds');
    //     buildDate = testingBuild.created_at;
    //     assets = testingBuild.assets || []
    //     wd['Linux-aarch64.AppImage'] = assets.find(asset => asset.name.endsWith('Linux-aarch64.AppImage'));
    //     wd['Linux-x86_64.AppImage'] = assets.find(asset => asset.name.endsWith('Linux-x86_64.AppImage'));
    //     wd['macOS-apple-silicon-arm64.dmg'] = assets.find(asset => asset.name.endsWith('macOS-apple-silicon-arm64.dmg'));
    //     wd['macOS-intel-x86_64.dmg'] = assets.find(asset => asset.name.endsWith('macOS-intel-x86_64.dmg'));
    //     // wd['Windows-x86_64-installer.exe'] = assets.find(asset => asset.name.endsWith('Windows-x86_64-installer.exe'));
    //     wd['Windows-x86_64.7z'] = assets.find(asset => asset.name.endsWith('Windows-x86_64.7z'));
    //     wd['Windows-x86_64.7z-SHA256.txt'] = assets.find(asset => asset.name.endsWith('Windows-x86_64.7z-SHA256.txt'));
    //     for (const [k, v] of Object.entries(wd)) {
    //       if (v.created_at) {
    //         if (v.created_at > buildDate) {
    //           buildDate = v.created_at;
    //         }
    //       }
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
    this.ondselSeDownload = osd;
    this.ondselSeVersionTxt = osVer;
    this.weeklyDownload = wd;
    this.weeklyBuildDate = buildDate.slice(0,10);
  },
  methods: {
    async scanPublisherCollection() {
    },
    async goPublicModels() {
      this.$router.push({name: 'PublicModels'})
    },
  },
}
</script>

<style scoped>

</style>
