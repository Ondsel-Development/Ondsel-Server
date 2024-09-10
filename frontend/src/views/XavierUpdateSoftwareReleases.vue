<template>
  <Main>
    <template #title>
      Xavier Update Software Releases
    </template>
    <template #content>
      <h2>Releases</h2>
      <v-data-table :items="releases"></v-data-table>
      <h2>Weekly Builds</h2>
      <v-data-table :items="weeklies"></v-data-table>
      <pre>
        <a href="https://github.com/Ondsel-Development/assets/releases">https://github.com/Ondsel-Development/assets/releases</a>
      </pre>
      <v-btn
        class="mr-2 mt-2"
        color="secondary"
        variant="elevated"
        @click="$refs.uploadSoftwareDialog.openFileUploadDialog();"
      >
        Upload File
      </v-btn>
      <v-btn
        class="mr-2 mt-2"
        color="secondary"
        variant="elevated"
        @click="scanPublisherCollection()"
      >
        Refresh Lens Column From Database
      </v-btn>
      <v-card>
        <v-card-title>
          <div class="text-center">Update GH JSON</div>
        </v-card-title>
        <v-card-subtitle>
          <pre>gh auth login</pre>
          <pre>gh api --method GET /repos/Ondsel-Development/assets/releases --header 'Accept: application/vnd.github+json' > latest_releases.json</pre>
        </v-card-subtitle>
        <v-card-text>
          <v-textarea
            v-model.trim="rawJson"
            label="Raw JSON"
            hint="Paste the raw GH releases JSON here"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            @click="scanReleaseJson()"
          >SCAN JSON</v-btn>
        </v-card-actions>
      </v-card>
      <xavier-upload-software-dialog
        ref="uploadSoftwareDialog"
        :release-file-types="releaseFileTypes"
        :weekly-file-types="weeklyFileTypes"
        @uploaded-file="updateEntry()"
      ></xavier-upload-software-dialog>
    </template>
  </Main>
</template>

<script>

import Main from '@/layouts/default/Main.vue';
import {mapState} from "vuex";
import XavierUploadSoftwareDialog from "@/components/XavierUploadSoftwareDialog.vue";
import {models} from "@feathersjs/vuex";

const { Publisher } = models.api;

export default {
  name: 'XavierUpdateSoftwareReleases',
  components: {
    XavierUploadSoftwareDialog,
    Main
  },
  data: () => ({
    ondselSeDownload: {},
    ondselSeVersionTxt: 'tbd',
    weeklyDownload: {},
    weeklyBuildDate: 'tbd',
    rawJson: '',
    releases: [],
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
    weeklies: [],
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
    if (!this.user || !this.user.isTripe) {
      console.log("alert-33235-ru");
      this.$router.push({name: 'LensHome', params: {}});
    }
    for (const key of this.releaseFileTypes) {
      this.releases.push({
        "name": key,
        "GH url": "TBD",
        "Lens": "TBD",
      })
    }
    for (const key of this.weeklyFileTypes) {
      this.weeklies.push({
        "name": key,
        "GH url": "TBD",
        "Lens": "TBD",
      })
    }
    await this.scanPublisherCollection();
  },
  methods: {
    async scanPublisherCollection() {
      const results = await Publisher.find({query: {$limit: 100}});
      const publishedList = results.data;
      for (const item of publishedList) {
        const name = item.target;
        const cadence = item.releaseCadence;
        if (cadence === 'stable') {
          this.setWebRelease(name, item);
        } else {
          this.setWebWeekly(name, item);
        }
      }
    },
    async scanReleaseJson() {
      let json = JSON.parse(this.rawJson);
      let wd = {};
      let osVer = 'unknown';
      let buildDate = 'unknown';
      const justCurrent = json.filter(build => build.prerelease !== true);
      const tagsFound = justCurrent.map(build => build.tag_name);
      const semverExp = new RegExp('^\\d{4}.'); // must start with four digits and a dot
      let semverTags = tagsFound.filter(tag => semverExp.test(tag));
      semverTags.sort();
      osVer = semverTags.pop();
      const ondselSeBuild = json.find(build => build.tag_name === osVer);
      let assets = ondselSeBuild.assets || []
      let temp = {}
      for (let key of this.releaseFileTypes) {
        temp = assets.find(asset => asset.name.endsWith(key));
        this.setGHRelease(key, temp);
      }
      const testingBuild = json.find(build => build.tag_name === 'weekly-builds');
      buildDate = testingBuild.created_at;
      assets = testingBuild.assets || []
      for (let key of this.weeklyFileTypes) {
        temp = assets.find(asset => asset.name.endsWith(key));
        this.setGHWeekly(key, temp);
      }
      for (const [k, v] of Object.entries(wd)) {
        if (v.created_at) {
          if (v.created_at > buildDate) {
            buildDate = v.created_at;
          }
        }
      }
      this.ondselSeVersionTxt = osVer;
      this.weeklyDownload = wd;
      this.weeklyBuildDate = buildDate.slice(0,10);
    },
    setGHRelease(name, obj) {
      let index = this.releases.findIndex(entry => entry.name === name);
      if (index >= 0) {
        this.releases[index]["GH url"] = obj.browser_download_url;
      }
    },
    setGHWeekly(name, obj) {
      let index = this.weeklies.findIndex(entry => entry.name === name);
      if (index >= 0) {
        this.weeklies[index]["GH url"] = obj.browser_download_url;
      }
    },
    setWebRelease(name, obj) {
      let index = this.releases.findIndex(entry => entry.name === name);
      if (index >= 0) {
        this.releases[index]["Lens"] = obj.filename;
      }
    },
    setWebWeekly(name, obj) {
      let index = this.weeklies.findIndex(entry => entry.name === name);
      if (index >= 0) {
        this.weeklies[index]["Lens"] = obj.filename;
      }
    },
    async updateEntry() {
      await this.scanPublisherCollection();
    },
  },
}
</script>

<style scoped>

</style>
