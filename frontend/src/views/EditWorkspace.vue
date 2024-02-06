<template>
  <v-container v-if="workspace">
    <v-row align="center">
      <div class="text-body-1">Workspace&nbsp;</div>
      <v-btn
        flat
        variant="plain"
        class="text-body-1 font-weight-bold pa-0"
        style="text-decoration: none;"
        @click="goHome()"
      >
        {{ workspace.name }}
      </v-btn>
    </v-row>

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">General Details</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Name</v-list-item-title>
          <v-list-item-subtitle>
            {{ workspace.name }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action>
              <v-btn
                v-if="!forbidNameChange"
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openWorkspaceChangeNameDialog()"
              >
                Change Name
              </v-btn>
              <div v-if="forbidNameChange"><i>{{forbidNameChangeReason}}</i></div>
              <v-spacer></v-spacer>
              <WorkspaceChangeNameDialog
                :is-active="isWorkspaceChangeNameDialogActive"
                :workspace="workspace"
                ref="workspaceChangeNameDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Slug</v-list-item-title>
          <v-list-item-subtitle>
            {{ workspace.refName }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Open to Public View</v-list-item-title>
          <v-list-item-subtitle>
            {{ workspace.open }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openWorkspaceOpenSelectDialog()"
                v-if="changableVisibility === true"
              >
                Change Visibility
              </v-btn>
              <div v-if="changableVisibility === false">
                <i> {{ changableVisibilityReason }} </i>
              </div>
              <v-spacer></v-spacer>
              <WorkspaceOpenSelectDialog
                :is-active="isWorkspaceOpenSelectDialogActive"
                :workspace="workspace"
                ref="workspaceOpenSelectDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Share License (if any)</v-list-item-title>
          <v-list-item-subtitle>
            {{ workspace.license || 'none assigned' }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openWorkspaceChangeLicenseDialog()"
              >
                Change License
              </v-btn>
              <v-spacer></v-spacer>
              <WorkspaceChangeLicenseDialog
                :is-active="isWorkspaceChangeLicenseDialogActive"
                :workspace="workspace"
                ref="workspaceChangeLicenseDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Short Description</v-list-item-title>
          <v-list-item-subtitle>
            {{ workspaceDetail.description }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openWorkspaceChangeDescDialog()"
              >
                Change Description
              </v-btn>
              <v-spacer></v-spacer>
              <WorkspaceChangeDescDialog
                :is-active="isWorkspaceChangeDescDialogActive"
                :workspace="workspace"
                ref="workspaceChangeDescDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

      </v-list>
    </v-card>

    <v-row class="mt-12" v-if="!userRouteFlag">
      <manage-workspace-users-table :workspace="workspace" />
    </v-row>
    <v-row class="mt-12" v-if="!userRouteFlag">
      <manage-workspace-groups-table :workspace="workspace" />
    </v-row>
    <v-row class="mt-12" v-if="userRouteFlag">
      <i>user and group rights do not apply here</i>
    </v-row>
  </v-container>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {mapActions, mapGetters, mapState} from 'vuex';
import ManageWorkspaceUsersTable from '@/components/ManageWorkspaceUsersTable.vue';
import ManageWorkspaceGroupsTable from '@/components/ManageWorkspaceGroupsTable.vue';
import WorkspaceChangeNameDialog from "@/components/WorkspaceChangeNameDialog.vue";
import WorkspaceChangeDescDialog from "@/components/WorkspaceChangeDescDialog.vue";
import WorkspaceOpenSelectDialog from "@/components/WorkspaceOpenSelectDialog.vue";
import WorkspaceChangeLicenseDialog from "@/components/WorkspaceChangeLicenseDialog.vue";

const { Organization } = models.api;

export default {
  name: "EditWorkspace",
  components: {
    WorkspaceChangeLicenseDialog,
    WorkspaceOpenSelectDialog,
    WorkspaceChangeNameDialog, WorkspaceChangeDescDialog, ManageWorkspaceGroupsTable, ManageWorkspaceUsersTable },
  data: () => ({
    workspaceDetail: {groupsOrUsers:[]},
    slug: '',
    changableVisibility: false,
    changableVisibilityReason: 'tbd',
    isWorkspaceChangeNameDialogActive: false,
    isWorkspaceChangeDescDialogActive: false,
    forbidNameChange: true,
    forbidNameChangeReason: 'tbd',
    isWorkspaceOpenSelectDialogActive: false,
    isWorkspaceChangeLicenseDialogActive: false,
  }),
  async created() {
    this.slug = this.$route.params.slug;
    if (this.userRouteFlag) {
      const userDetail = await this.getUserByIdOrNamePublic(this.slug);
      if (!userDetail) {
        this.$router.push({ name: 'PageNotFound' });
        return;
      }
      this.workspaceDetail = await this.getWorkspaceByNamePrivate({wsName: this.$route.params.wsname, orgName: userDetail._id.toString()} );
    } else {
      this.workspaceDetail = await this.getWorkspaceByNamePrivate({wsName: this.$route.params.wsname, orgName: this.slug} );
    }
    if (!this.workspaceDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
    if (this.workspace.organizationId !== this.currentOrganization._id) {
      if (this.workspace.organization.type !== 'Open') {
        this.$router.push({ name: 'PermissionError', params: {slug: this.organization?.refName, urlCode: `/org/${this.organization?.refName}/workspace/${this.workspaceRefName}/edit`}})
      }
    }
    switch (this.workspace.organization.type) {
      case 'Personal':
        if (this.user.tier === 'Peer' || this.user.tier === 'Enterprise') {
          this.changableVisibility = true;
        } else {
          this.changableVisibility = false;
          this.changableVisibilityReason = `cannot change at ${this.user.tier} tier`
        }
        if (this.user.defaultWorkspaceId.toString() === this.workspace._id.toString()) {
          this.forbidNameChange = true;
          this.forbidNameChangeReason = 'default Personal workspace name not editable';
        } else {
          this.forbidNameChange = false;
        }
        break;
      case 'Open':
        this.forbidNameChange = false;
        this.changableVisibility = false;
        this.changableVisibilityReason = `this is an open org`
        break;
      case 'Private':
        this.forbidNameChange = false;
        this.changableVisibility = true;
        break;
    }
    if (!this.organization) {
      // require for manage user and group of workspace
      await Organization.get(this.workspace.organizationId);
    }
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    ...mapState('auth', ['user']),
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
    organization: vm => Organization.getFromStore(vm.workspace.organizationId),
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization', 'getWorkspaceByNamePrivate', 'getUserByIdOrNamePublic']),
    async goHome() {
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaceHome', params: { slug: this.slug, wsname: this.workspace.refName } });
      } else {
        this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: this.slug, wsname: this.workspace.refName } });
      }
    },
    async openWorkspaceChangeNameDialog() {
      this.isWorkspaceChangeNameDialogActive = true;
      this.$refs.workspaceChangeNameDialog.$data.newWorkspaceName = this.workspace.name;
      this.$refs.workspaceChangeNameDialog.$data.allowNameChange = !this.forbidNameChange;
      this.$refs.workspaceChangeNameDialog.$data.dialog = true;
    },
    async openWorkspaceChangeDescDialog() {
      this.isWorkspaceChangeDescDialogActive = true;
      this.$refs.workspaceChangeDescDialog.$data.newWorkspaceDesc = this.workspace.description;
      this.$refs.workspaceChangeDescDialog.$data.dialog = true;
    },
    async openWorkspaceOpenSelectDialog() {
      this.isWorkspaceOpenSelectDialogActive = true;
      this.$refs.workspaceOpenSelectDialog.$data.newOpenSelect = this.workspace.open.toString();
      this.$refs.workspaceOpenSelectDialog.$data.dialog = true;
    },
    async openWorkspaceChangeLicenseDialog() {
      this.isWorkspaceChangeLicenseDialogActive = true;
      this.$refs.workspaceChangeLicenseDialog.$data.newLicense = this.workspace.license || "null";
      this.$refs.workspaceChangeLicenseDialog.$data.dialog = true;
    },
  }
}
</script>

<style scoped>

</style>
