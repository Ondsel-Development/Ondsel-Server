<template>
  <v-container v-if="organization">
    <v-row class="align-center">
      <div class="text-h6">{{orgWorkspaceLabel}}</div>
      <v-spacer />
      <div class="align-end">
        <v-btn flat @click="$refs.createWorkspace.$data.dialog = true;">Create new Workspace</v-btn>
      </div>
    </v-row>
    <v-row class="mt-6">
      <v-col
        cols="6"
        v-for="workspace in workspaces.data"
        :key="workspace._id"
      >
        <v-card
          class="mx-auto"
          variant="elevated"
        >
          <template #title>
            <div class="text-h6">{{ workspace.name }} <span class="text-body-2">({{ workspace.description }})</span></div>
          </template>
          <template #subtitle>
            <div class="text-body-2">{{ (new Date(workspace.createdAt)).toDateString() }}</div>
          </template>
          <template v-slot:append>
            <v-btn icon="mdi-pencil" flat @click="goToWorkspaceEdit(workspace)"/>
            <v-btn icon="mdi-arrow-right" flat @click="goToWorkspaceHome(workspace)"/>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <create-workspace-dialog ref="createWorkspace" :organization="organization" />
  </v-container>
  <v-row dense class="justify-center">
    <template v-if="workspaces.data.length && isFindPending">
      <v-progress-circular indeterminate></v-progress-circular>
    </template>
    <template v-else-if="workspaces.data.length === 0">
      <div class="text-grey-darken-1">No workspace exist!</div>
    </template>
    <template v-else-if="workspaces.data.length === paginationData[orgId]?.total">
      <div class="text-grey-darken-1">You reached the end!</div>
    </template>
    <template v-else>
      <v-btn flat variant="text" @click.stop="fetchWorkspaces">Load more</v-btn>
    </template>
  </v-row>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import CreateWorkspaceDialog from '@/components/CreateWorkspaceDialog.vue';

const { Organization, Workspace, User } = models.api;

export default {
  name: 'OrganizationHome',
  components: { CreateWorkspaceDialog },
  data: () => ({
    paginationData: {},
    organization: undefined,
    orgId: undefined,
    orgName: undefined,
    userName: undefined, // username of the Personal org (if applies), not the username of web page visitor
    foundUser: {},
    workspaces: {data: []},
    // orgWorkspaceLabel: "pending...",
  }),
  async created() {
    // //const org = await Organization.getFromStore(this.orgId);
    // await this.setCurrentOrganization(this.organization);
  },
  async mounted() {
    // await this.fetchWorkspaces();
    await this.fetchOrganization();
    this.initPagination(this.orgId);
    try {
      await Organization.get(this.orgId);
    } catch (e) {
      if (e.data.type === 'PermissionError') {
        this.$router.push({ name: 'PageNotFound' });
      }
    }
    window.addEventListener('scroll', () => {
      if(document.documentElement.scrollHeight <= window.scrollY + window.innerHeight + 1) {
        this.fetchWorkspaces();
      }
    });
  },
  computed: {
    ...mapState('workspaces', ['isFindPending']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    orgWorkspaceLabel: vm => vm.userName ? `Personal Workspaces for ${vm.foundUser?.name}` : `Workspaces for ${vm.organization.name}`,
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
    initPagination(id) {
      if (!(id in this.paginationData)) {
        this.paginationData[id] = {
          limit: 50,
          skip: 0,
          total: null,
        };
      }
    },
    async fetchWorkspaces() {
      if (!this.orgId) {
        return;
      }
      if (this.isFindPending) {
        return;
      }
      this.initPagination(this.orgId);
      if (this.workspaces.data.length !== this.paginationData[this.orgId].total) {
        const wsList = await Workspace.find({
          query: {
            $limit: this.paginationData[this.orgId].limit,
            $skip: this.paginationData[this.orgId].skip,
            organizationId: this.orgId,
          }
        });
        this.paginationData[this.orgId].skip = wsList.skip + this.paginationData[this.orgId].limit;
        this.paginationData[this.orgId].total = wsList.total;
      }
    },
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'WorkspaceHome', params: { id: workspace._id } });
    },
    async goToWorkspaceEdit(workspace) {
      this.$router.push({ name: 'EditWorkspace', params: { id: workspace._id } });
    },
    async fetchOrganization() {
      this.userName = this.$route.params.username;
      this.orgName = this.$route.params.orgName;
      if (this.userName) {
        const targetUser = await User.find({
          query: {username: this.userName}
        })
        if (targetUser.total === 0) {
          console.log(`Error: cannot find user ${this.userName}`);
          return;
        }
        this.foundUser = targetUser.data[0];
        this.orgName = this.foundUser._id.toString();
      }
      const orgResult = await Organization.find({
        query: {
          refName: this.orgName,
        }
      });
      this.organization = orgResult.data[0];
      this.orgId = this.organization._id.toString();
      this.workspaces = await Workspace.find({ organizationId: this.orgId });
    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationHome') {
        // this.fetchWorkspaces();
      }
    }
  }
}
</script>

<style scoped>
</style>
