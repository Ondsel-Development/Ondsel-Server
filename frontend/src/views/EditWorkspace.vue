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
    <v-row class="mt-12" v-if="!userRouteFlag">
      <manage-workspace-users-table :workspace="workspace" />
    </v-row>
    <v-row class="mt-12" v-if="!userRouteFlag">
      <manage-workspace-groups-table :workspace="workspace" />
    </v-row>
    <v-row class="mt-12" v-if="userRouteFlag">
      <i>no data to edit for a private workspace</i>
    </v-row>
  </v-container>
</template>

<script>
import ManageWorkspaceUsersTable from '@/components/ManageWorkspaceUsersTable.vue';
import ManageWorkspaceGroupsTable from '@/components/ManageWorkspaceGroupsTable.vue';
import {mapActions, mapGetters} from 'vuex';

export default {
  name: "EditWorkspace",
  components: { ManageWorkspaceGroupsTable, ManageWorkspaceUsersTable },
  data: () => ({
    workspaceDetail: {groupsOrUsers:[]},
    slug: '',
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
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    workspaceRefName: vm => vm.$route.params.wsname,
    workspace: vm => vm.workspaceDetail,
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
    }
  }
}
</script>

<style scoped>

</style>
