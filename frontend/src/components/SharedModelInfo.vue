<template>
  <v-card flat>
    <v-card-title style="text-align: center;">ShareLink Information</v-card-title>
    <v-card-item style="justify-content: center;">
      <v-table density="comfortable" style="width: 600px; text-align: left;">
        <tbody>
          <tr v-if="sharedModel && sharedModel.title">
            <td class="font-weight-medium">Title</td>
            <td><b>{{ sharedModel.title }}</b></td>
          </tr>
          <tr v-if="fileObject">
            <td class="font-weight-medium">Date</td>
            <td>{{ dateFormat(fileObject.createdAt) }}</td>
          </tr>
          <tr v-if="sharedModel && sharedModel.curation?.tags">
            <td class="font-weight-medium">Tags</td>
            <td>
              <v-chip-group>
                <v-chip v-for="(tag) in sharedModel.curation.tags" :key="tag">{{tag}}</v-chip>
              </v-chip-group>
              <v-sheet v-if="sharedModel.curation.tags.length===0"><i>no tags</i></v-sheet>
            </td>
          </tr>
          <tr>
            <td class="font-weight-medium">Version</td>
            <td>
              <v-sheet v-if="sharedModel.versionFollowing === 'Locked'">
                Showing a <i>specific</i> version of the original file
              </v-sheet>
              <v-sheet v-else>
                Showing <i>the active</i> version of the original file
              </v-sheet>
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
          <tr v-if="organization && fileObject && open">
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
          <tr v-if="organization && fileObject && open">
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
  name: "SharedModelInfo",
  props: {
    sharedModel: {
      type: Object,
      required: false,
    }
  },
  data: () => ({
    user: null,
    workspace: null,
    organization: null,
    open: false,
    isDataFetchingInProgress: false,
  }),
  computed: {
    fileObject() {
      if (this.sharedModel) {
        return this.sharedModel.cloneModel.file;
      }
      return null;
    }
  },
  async mounted() {
    await this.fetchSharedModelInfoData();
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    async fetchSharedModelInfoData() {
      console.log("HERE1");
      this.isDataFetchingInProgress = true;
      this.user = await this.getUserByIdOrNamePublic(this.fileObject.userId);
      if (this.fileObject.workspace) {
        this.workspace = await this.getWorkspaceByIdPublic(this.fileObject.workspace._id);
        this.organization = await this.getOrgByIdOrNamePublic(this.workspace.organizationId);
      }
      this.open = this.fileObject?.workspace?.open === true;
      console.log("HERE2");
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
