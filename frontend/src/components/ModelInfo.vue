<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-card flat>
    <v-card-title style="text-align: center;">CAD Model Display Information</v-card-title>
    <v-card-item style="justify-content: center;">
      <v-table density="comfortable" style="width: 600px; text-align: left;">
        <tbody>
          <tr v-if="fileObject">
            <td class="font-weight-medium">Date</td>
            <td>{{ dateFormat(fileObject.createdAt) }}</td>
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
          <tr v-if="organization && fileObject">
            <td class="font-weight-medium">Workspace</td>
            <td>
              <v-btn
                color="link"
                variant="plain"
                class="text-body-1 font-weight-medium pa-0"
                style="text-decoration: none;"
                @click.stop="gotoWorkspace()"
              >
                "{{ fileObject.workspace.name }}"&nbsp;
                <span v-if="organization.type === 'Personal' && user">
                   of user {{ user.name }}
                </span>
                <span v-else>
                  of org {{ organization.name }}
                </span>
              </v-btn>
            </td>
          </tr>
          <tr v-if="organization && fileObject">
            <td class="font-weight-medium">File</td>
            <td>
              <v-btn
                color="link"
                variant="plain"
                class="text-body-1 font-weight-medium pa-0"
                style="text-decoration: none;"
                @click.stop="gotoFile()"
              >
                "{{ fileObject.custFileName }}"&nbsp;
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-item>
  </v-card>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "ModelInfo",
  props: {
    model: {
      type: Object,
      required: false,
    },
  },
  data: () => ({
    user: null,
    workspace: null,
    organization: null,
    isDataFetchingInProgress: false,
  }),
  computed: {
    fileObject() {
      if (this.model) {
        return this.model.file;
      }
      return null;
    }
  },
  async mounted() {
    await this.fetchModelInfoData();
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    async fetchModelInfoData() {
      this.isDataFetchingInProgress = true;
      this.user = await this.getUserByIdOrNamePublic(this.fileObject.userId);
      if (this.fileObject.workspace) {
        this.workspace = await this.getWorkspaceByIdPublic(this.fileObject.workspace._id);
        this.organization = await this.getOrgByIdOrNamePublic(this.workspace.organizationId);
      }
    },
    async gotoWorkspace() {
      if (this.organization.type === 'Personal') {
        this.$router.push({
          name: 'UserWorkspaceHome',
          params: {slug: this.user.username, wsname: this.fileObject.workspace.refName}
        });
      } else {
        this.$router.push({
          name: 'OrgWorkspaceHome',
          params: {slug: this.organization.refName, wsname: this.fileObject.workspace.refName}
        });
      }
    },
    async gotoFile() {
      if (this.organization.type === 'Personal') {
        this.$router.push({
          name: 'UserWorkspaceFile',
          params: {slug: this.user.username, wsname: this.fileObject.workspace.refName, fileid: this.fileObject._id.toString()}
        });
      } else {
        this.$router.push({
          name: 'OrgWorkspaceFile',
          params: {slug: this.organization.refName, wsname: this.fileObject.workspace.refName, fileid: this.fileObject._id.toString()}
        });
      }
    },
  }
}
</script>

<style scoped>

</style>
