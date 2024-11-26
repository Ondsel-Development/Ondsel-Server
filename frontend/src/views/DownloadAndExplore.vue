<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-container class="d-flex flex-column justify-center">
    <signup-progress-bar step="2" msg="recommend downloading Ondsel ES next"></signup-progress-bar>
    <v-card v-if="promptForSurvey">
      <v-card-text>
        <markdown-viewer :markdown-html="promptForSurveyHtml"></markdown-viewer>
      </v-card-text>
    </v-card>
    <v-container class="d-flex flex-wrap justify-center">
      <v-card flat>
        <v-card-title>Download</v-card-title>
        <v-card-text>
          <v-card width="30em">
            <v-card-title>Ondsel ES</v-card-title>
            <v-card-subtitle>v {{ondselEsVersionTxt}}</v-card-subtitle>
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
                  <download-published-link
                    :details="ondselEsDownload['Linux-x86_64.AppImage']"
                    :user-id="userId"
                    :small="false"
                  ></download-published-link>
                  <download-published-link
                    :details="ondselEsDownload['Linux-x86_64.AppImage-SHA256.txt']"
                    :user-id="userId"
                    :small="true"
                  ></download-published-link>
                  <p/>
                  <download-published-link
                    :details="ondselEsDownload['Linux-aarch64.AppImage']"
                    :user-id="userId"
                    :small="false"
                  ></download-published-link>
                  <download-published-link
                    :details="ondselEsDownload['Linux-aarch64.AppImage-SHA256.txt']"
                    :user-id="userId"
                    :small="true"
                  ></download-published-link>
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
                  <download-published-link
                    :details="ondselEsDownload['macOS-apple-silicon-arm64.dmg']"
                    :user-id="userId"
                    :small="false"
                  ></download-published-link>
                  <download-published-link
                    :details="ondselEsDownload['macOS-apple-silicon-arm64.dmg-SHA256.txt']"
                    :user-id="userId"
                    :small="true"
                  ></download-published-link>
                  <p/>
                  <download-published-link
                    :details="ondselEsDownload['macOS-intel-x86_64.dmg']"
                    :user-id="userId"
                    :small="false"
                  ></download-published-link>
                  <download-published-link
                    :details="ondselEsDownload['macOS-intel-x86_64.dmg-SHA256.txt']"
                    :user-id="userId"
                    :small="true"
                  ></download-published-link>
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
                  <download-published-link
                    :details="ondselEsDownload['Windows-x86_64-installer.exe']"
                    :user-id="userId"
                    :small="false"
                  ></download-published-link>
                  <download-published-link
                    :details="ondselEsDownload['Windows-x86_64-installer.exe-SHA256.txt']"
                    :user-id="userId"
                    :small="true"
                  ></download-published-link>
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
                        <download-published-link
                          :details="weeklyDownload['Linux-x86_64.AppImage']"
                          :user-id="userId"
                          :small="false"
                        ></download-published-link>
                        <p/>
                        <download-published-link
                          :details="weeklyDownload['Linux-aarch64.AppImage']"
                          :user-id="userId"
                          :small="false"
                        ></download-published-link>
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
                        <download-published-link
                          :details="weeklyDownload['macOS-apple-silicon-arm64.dmg']"
                          :user-id="userId"
                          :small="false"
                        ></download-published-link>
                        <p/>
                        <download-published-link
                          :details="weeklyDownload['macOS-intel-x86_64.dmg']"
                          :user-id="userId"
                          :small="false"
                        ></download-published-link>
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
                        <download-published-link
                          :details="weeklyDownload['Windows-x86_64.7z']"
                          :user-id="userId"
                          :small="false"
                        ></download-published-link>
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
        <i>You can always get back to this page from the left-hand menu.</i>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import SignupProgressBar from "@/components/SignupProgressBar.vue";
import {models} from "@feathersjs/vuex";
import DownloadPublishedLink from "@/components/DownloadPublishedLink.vue";
import {marked} from "marked";
import MarkdownViewer from "@/components/MarkdownViewer.vue";

const { Agreements } = models.api;

export default {
  name: 'DownloadAndExplore',
  components: {MarkdownViewer, DownloadPublishedLink, SignupProgressBar},
  data: () => ({
    promptForSurvey: false,
    promptForSurveyHtml: '',
    ondselEsDownload: {},
    ondselEsVersionTxt: 'tbd',
    weeklyDownload: {},
    weeklyBuildDate: 'tbd',
    releaseFileTypes: {
      'Linux-x86_64.AppImage': 'x86_64 AppImage',
      'Linux-x86_64.AppImage-SHA256.txt': 'SHA256',
      'Linux-aarch64.AppImage': 'aarch64 AppImage',
      'Linux-aarch64.AppImage-SHA256.txt': 'SHA256',
      'macOS-apple-silicon-arm64.dmg': 'Apple Silicon dmg',
      'macOS-apple-silicon-arm64.dmg-SHA256.txt': 'SHA256',
      'macOS-intel-x86_64.dmg': "Intel dmg",
      'macOS-intel-x86_64.dmg-SHA256.txt': 'SHA256',
      'Windows-x86_64-installer.exe': 'x86_64 installer',
      'Windows-x86_64-installer.exe-SHA256.txt': 'SHA256',
    },
    weeklyFileTypes: {
      'Linux-aarch64.AppImage': 'aarch64 AppImage',
      'Linux-x86_64.AppImage': 'x86_64 AppImage',
      'macOS-apple-silicon-arm64.dmg': 'Apple Silicon dmg',
      'macOS-intel-x86_64.dmg': "Intel dmg",
      'Windows-x86_64.7z': 'x86_64.7z',
    },
    userId: '',
  }),
  computed: {
  },
  async created() {
    let osd = {};
    osd['Linux-x86_64.AppImage'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-Linux-x86_64.AppImage',
      shortName: this.releaseFileTypes['Linux-x86_64.AppImage'],
      releaseDate: false
    }
    osd['Linux-x86_64.AppImage-SHA256.txt'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-Linux-x86_64.AppImage-SHA256.txt',
      shortName: this.releaseFileTypes['Linux-x86_64.AppImage-SHA256.txt'],
      releaseDate: false
    }
    osd['Linux-aarch64.AppImage'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-Linux-aarch64.AppImage',
      shortName: this.releaseFileTypes['Linux-aarch64.AppImage'],
      releaseDate: false
    }
    osd['Linux-aarch64.AppImage-SHA256.txt'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-Linux-aarch64.AppImage-SHA256.txt',
      shortName: this.releaseFileTypes['Linux-aarch64.AppImage-SHA256.txt'],
      releaseDate: false
    }
    osd['macOS-apple-silicon-arm64.dmg'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-macOS-apple-silicon-arm64.dmg',
      shortName: this.releaseFileTypes['macOS-apple-silicon-arm64.dmg'],
      releaseDate: false
    }
    osd['macOS-apple-silicon-arm64.dmg-SHA256.txt'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-macOS-apple-silicon-arm64.dmg-SHA256.txt',
      shortName: this.releaseFileTypes['macOS-apple-silicon-arm64.dmg-SHA256.txt'],
      releaseDate: false
    }
    osd['macOS-intel-x86_64.dmg'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-macOS-intel-x86_64.dmg',
      shortName: this.releaseFileTypes['macOS-intel-x86_64.dmg'],
      releaseDate: false
    }
    osd['macOS-intel-x86_64.dmg-SHA256.txt'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES_2024.2.2.37240-macOS-intel-x86_64.dmg-SHA256.txt',
      shortName: this.releaseFileTypes['macOS-intel-x86_64.dmg-SHA256.txt'],
      releaseDate: false
    }
    osd['Windows-x86_64-installer.exe'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES-2024.2.2.37240-Windows-x86_64-installer.exe',
      shortName: this.releaseFileTypes['Windows-x86_64-installer.exe'],
      releaseDate: false
    }
    osd['Windows-x86_64-installer.exe-SHA256.txt'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/2024.2.2/Ondsel_ES-2024.2.2.37240-Windows-x86_64-installer.exe-SHA256.txt',
      shortName: this.releaseFileTypes['Windows-x86_64-installer.exe-SHA256.txt'],
      releaseDate: false
    }
    let wd = {};
    wd['Linux-x86_64.AppImage'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/weekly-builds/Ondsel_ES_weekly-builds-39025-Linux-x86_64.AppImage',
      shortName: this.weeklyFileTypes['Linux-x86_64.AppImage'],
      releaseDate: false
    }
    wd['Linux-aarch64.AppImage'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/weekly-builds/Ondsel_ES_weekly-builds-39025-Linux-aarch64.AppImage',
      shortName: this.weeklyFileTypes['Linux-aarch64.AppImage'],
      releaseDate: false
    }
    wd['macOS-apple-silicon-arm64.dmg'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/weekly-builds/Ondsel_ES_weekly-builds-39025-macOS-apple-silicon-arm64.dmg',
      shortName: this.weeklyFileTypes['macOS-apple-silicon-arm64.dmg'],
      releaseDate: false
    }
    wd['macOS-intel-x86_64.dmg'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/weekly-builds/Ondsel_ES_weekly-builds-39025-macOS-intel-x86_64.dmg',
      shortName: this.weeklyFileTypes['macOS-intel-x86_64.dmg'],
      releaseDate: false
    }
    wd['Windows-x86_64.7z'] = {
      browser_download_url: 'https://github.com/Ondsel-Development/assets/releases/download/weekly-builds/Ondsel_ES_weekly-builds-39025-Windows-x86_64.7z',
      shortName: this.weeklyFileTypes['Windows-x86_64.7z'],
      releaseDate: false
    }
    //   if (cadence === 'stable') {
    //     const shortName = this.releaseFileTypes[target];
    //     osd[target] = item;
    //     osd[target].browser_download_url = url;
    //     osd[target].shortName = shortName;
    //     osd[target].releaseDate = false; // prevents display
    //     osVer = item.release;
    //   } else {
    //     const shortName = this.weeklyFileTypes[target];
    //     wd[target] = item;
    //     wd[target].browser_download_url = url;
    //     wd[target].shortName = shortName;
    //     buildDate = this.dateFormat(item.releaseDate);
    //   }
    // }
    this.ondselEsDownload = osd;
    this.ondselEsVersionTxt = "2024.2.2";
    this.weeklyDownload = wd;
    this.weeklyBuildDate = "Oct 22, 2024";
  },
  methods: {
    async getSurveyPrompt() {
      Agreements.find({
        query: {category: 'signup-survey-prompt'}
      }).then(response => {
        if (response.data.length > 0) {
          const promptDoc = response.data[0];
          this.promptForSurvey = true;
          this.promptForSurveyHtml = marked.parse(promptDoc.current.markdownContent);
        }
      }).catch((e) => {
        console.error(e);
      })
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
