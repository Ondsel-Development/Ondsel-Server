<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
      v-model="dialog"
      width="auto"
  >
    <v-card width="500" max-height="800">
      <v-progress-linear
          :active="isGetPending || isDataFetchingInProgress"
          indeterminate
          absolute
          bottom
      ></v-progress-linear>
      <v-card-title style="text-align: center;">Assembly Part Information</v-card-title>
      <v-card-item style="justify-content: center;">
        <v-table density="comfortable" style="width: 600px; text-align: left;">
          <tbody>
          <tr v-if="file">
            <td class="font-weight-medium">Date</td>
            <td>{{ dateFormat(file.createdAt) }}</td>
          </tr>
          <tr v-if="file">
            <td class="font-weight-medium">File</td>
            <td>
              <v-btn
                  color="link"
                  variant="plain"
                  append-icon="mdi-open-in-new"
                  class="text-body-1 font-weight-medium pa-0"
                  style="text-decoration: none;"
                  :to="{ name: 'Home', params: { id: file.modelId } }"
                  target="_blank"
              >
                {{ fileName }}
              </v-btn>
            </td>
          </tr>
          <tr v-if="user">
            <td class="font-weight-medium">Created By</td>
            <td>
              <v-btn
                  color="link"
                  variant="plain"
                  append-icon="mdi-open-in-new"
                  class="text-body-1 font-weight-medium pa-0"
                  style="text-decoration: none;"
                  :to="{ name: 'UserHome', params: { slug: user.username } }"
                  target="_blank"
              >
                {{ user.name }}
              </v-btn>
            </td>
          </tr>
          <tr v-if="organization">
            <td class="font-weight-medium">Organization</td>
            <td>
              <v-btn
                  color="link"
                  variant="plain"
                  append-icon="mdi-open-in-new"
                  class="text-body-1 font-weight-medium pa-0"
                  style="text-decoration: none;"
                  :to="{ name: 'OrganizationHome', params: { slug: organization.refName } }"
                  target="_blank"
              >
                <template v-if="organization.type === 'Personal' && user">
                  {{ user.name }} (Personal)
                </template>
                <template v-else>
                  {{ organization.name }}
                </template>
              </v-btn>
            </td>
          </tr>
          <tr v-if="organization && file && file.workspace?.open === true">
            <td class="font-weight-medium">Workspace</td>
            <td>
              <v-btn
                  color="link"
                  variant="plain"
                  append-icon="mdi-open-in-new"
                  class="text-body-1 font-weight-medium pa-0"
                  style="text-decoration: none;"
                  @click.stop="gotoWorkspace()"
                  target="_blank"
              >
                {{ file.workspace.name }}&nbsp;
                <span v-if="organization.type === 'Personal' && user">
                   of user {{ user.name }}
                </span>
                <span v-else>
                  of org {{ organization.name }}
                </span>
              </v-btn>
            </td>
          </tr>
          </tbody>
        </v-table>
      </v-card-item>
      <v-card-actions class="justify-center">
        <v-btn
            color="cancel"
            variant="elevated"
            @click="dialog = false"
        >Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { models } from '@feathersjs/vuex';
import { mapState, mapActions } from 'vuex';

const { Directory, File } = models.api;

export default {
  name: "AssemblyObjectInfoDialog",
  data: () => ({
    dialog: false,
    directoryId: null,
    fileName: null,
    isDataFetchingInProgress: false,
    user: null,
    workspace: null,
    organization: null,
    fileSummary: null,
  }),
  computed: {
    ...mapState('directories', ['isGetPending']),
    directory: vm => Directory.getFromStore(vm.directoryId),
    file: vm => File.getFromStore(vm.fileSummary?._id),
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    async fetchData() {
      this.isDataFetchingInProgress = true;
      this.user = await this.getUserByIdOrNamePublic(this.file.userId);
      if (this.file.workspace) {
        this.workspace = await this.getWorkspaceByIdPublic(this.file.workspace._id);
        this.organization = await this.getOrgByIdOrNamePublic(this.workspace.organizationId);
      }
      this.isDataFetchingInProgress = false;
    },
    async gotoWorkspace() {
      let routeData;
      if (this.organization.type === 'Personal') {
        routeData = {
          name: 'UserWorkspaceHome',
          params: {slug: this.user.username, wsname: this.file.workspace.refName}
        };
      } else {
        routeData = {
          name: 'OrgWorkspaceHome',
          params: {slug: this.organization.refName, wsname: this.file.workspace.refName}
        };
      }
      // Resolve the route to a URL
      const { href } = this.$router.resolve(routeData);

      // Open the URL in a new tab
      window.open(href, '_blank');
    },
    async getFile(fileName) {
      let file;
      let dirNames = fileName.split('/');
      const custFileName = dirNames.pop();
      let directory = Directory.getFromStore(this.directoryId) || await Directory.get(this.directoryId);
      if (fileName.includes('/')) {
        let directoryId;
        for (let directoryName of dirNames) {
          if (directoryName === '..') {
            directoryId = directory.parentDirectory._id;
          } else {
            for (let directorySummary of directory.directories) {
              if (directorySummary.name === directoryName) {
                directoryId = directorySummary._id;
                break;
              }
            }
          }
          directory = Directory.getFromStore(directoryId) || await Directory.get(directoryId);
        }
      }
      for (let fileSummary of directory.files) {
        if (fileSummary.custFileName === custFileName) {
          file = fileSummary;
        }
      }
      return file;
    },
    async openDialog(directoryId, fileName) {
      if (directoryId && fileName) {
        this.directoryId = directoryId;
        this.fileName = fileName;
        this.dialog = true;
        this.fileSummary = await this.getFile(fileName);
        if (this.fileSummary && !this.file) {
          await File.get(this.fileSummary._id);
        }
        this.fetchData();
      }
    }
  }
}
</script>

<style scoped>

</style>
