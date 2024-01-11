<template>
  <v-card flat>
    <v-card-title style="text-align: center;">Model Information</v-card-title>
    <v-card-item style="justify-content: center;">
      <v-table density="comfortable" style="width: 600px; text-align: center;">
        <tbody>
          <tr v-if="fileObject">
            <td class="font-weight-medium">Date</td>
            <td>{{ dateFormat(fileObject.createdAt) }}</td>
          </tr>
          <tr v-if="fileObject">
            <td class="font-weight-medium">Name</td>
            <td>{{ fileObject.custFileName }}</td>
          </tr>
          <tr v-if="user">
            <td class="font-weight-medium">Created By</td>
            <td>
              <v-btn
                flat
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
                flat
                variant="plain"
                append-icon="mdi-open-in-new"
                class="text-body-1 font-weight-medium pa-0"
                style="text-decoration: none;"
                :to="{ name: 'OrganizationHome', params: { slug: organization.refName } }"
                target="_blank"
              >
                <template v-if="organization.type === 'Personal'">
                  {{ user.name }} (Personal)
                </template>
                <template v-else>
                  {{ organization.name }}
                </template>
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
    sharedModel: {
      type: Object,
      required: false,
    }
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
      if (this.sharedModel) {
        return this.sharedModel.cloneModel.file;
      }
    }
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    async fetchData() {
      this.isDataFetchingInProgress = true;
      this.user = await this.getUserByIdOrNamePublic(this.fileObject.userId);
      if (this.fileObject.workspace) {
        this.workspace = await this.getWorkspaceByIdPublic(this.fileObject.workspace._id);
        this.organization = await this.getOrgByIdOrNamePublic(this.workspace.organizationId);
      }
      this.isDataFetchingInProgress = false;
    }
  }
}
</script>

<style scoped>

</style>
