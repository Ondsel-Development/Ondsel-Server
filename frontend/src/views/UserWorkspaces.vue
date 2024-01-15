<template>
  <v-container v-if="organization">
    <v-row class="align-center">
      <div class="text-h6">Personal Workspaces</div>
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
    <template v-if="isFindPending">
      <v-progress-circular indeterminate></v-progress-circular>
    </template>
    <template v-else-if="workspaces.data?.length === 0">
      <div class="text-grey-darken-1">No workspace exist!</div>
    </template>
    <template v-else-if="workspaces.data?.length === paginationData[orgName]?.total">
      <div class="text-grey-darken-1">You reached the end!</div>
    </template>
    <template v-else>
      <v-btn flat variant="text" @click.stop="fetchDataOnScroll">Load more</v-btn>
    </template>
  </v-row>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';
import CreateWorkspaceDialog from '@/components/CreateWorkspaceDialog.vue';
import scrollListenerMixin from '@/mixins/scrollListenerMixin';

const { Organization, Workspace } = models.api;

export default {
  name: 'UserWorkspaces',
  components: { CreateWorkspaceDialog },
  mixins: [scrollListenerMixin],
  data: () => ({
    paginationData: {},
    orgSrc: null,
    orgName: "",
  }),
  async created() {
    this.orgName = this.user._id.toString();
    if (this.username !== this.user.username) { // this page should only be seen by the actual user
      this.$router.push({ name: 'PermissionError', params: {slug: this.username, urlCode: `/user/${this.username}/workspaces`}})
    }
    if (this.userCurrentOrganization.refName !== this.user._id.toString()) { // this page should only be seen by the actual user
      this.$router.push({ name: 'PermissionError', params: {slug: this.username, urlCode: `/user/${this.username}/workspaces`}})
    }
    this.orgSrc = await this.getOrgByIdOrNamePublic(this.orgName);
    this.initPagination(this.orgName);
    try {
      await Organization.get(this.orgName);
    } catch (e) {
      if (e.data?.type === 'PermissionError') {
        this.$router.push({ name: 'PageNotFound' });
      } else if (e.toString().startsWith('NotFound')) {
        this.$router.push({ name: 'PageNotFound' });
      } else {
        console.log(e.data);
        console.log(e);
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    // Use a callback with "next" to pass the instantiated component
    next(vm => { vm.setupScrollListener(); });
  },

  beforeRouteLeave(to, from, next) {
    this.removeScrollListener();
    next();
  },
  async mounted() {
    await this.fetchDataOnScroll();
  },
  computed: {
    ...mapState('workspaces', ['isFindPending']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    username: vm => vm.$route.params.id,
    workspaces: vm => Workspace.findInStore({ query: { $limit: 20, "organization.refName": vm.user._id.toString() } }),
    organization: vm => vm.orgSrc,
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    initPagination(id) {
      if (!(id in this.paginationData)) {
        this.paginationData[id] = {
          limit: 50,
          skip: 0,
          total: null,
        };
      }
    },
    async fetchDataOnScroll() {
      if (this.isFindPending) {
        return;
      }
      this.orgSrc = await this.getOrgByIdOrNamePublic(this.orgName);
      this.initPagination(this.orgName);
      if (this.workspaces.data.length !== this.paginationData[this.orgName].total) {
        const workspaces = await Workspace.find({
          query: {
            $limit: this.paginationData[this.orgName].limit,
            $skip: this.paginationData[this.orgName].skip,
            "organization.refName": this.orgName,
          }
        });
        this.paginationData[this.orgName].skip = workspaces.skip + this.paginationData[this.orgName].limit;
        this.paginationData[this.orgName].total = workspaces.total;
      }
    },
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'UserWorkspaceHome', params: { slug: this.username, wsname: workspace.refName } });
    },
    async goToWorkspaceEdit(workspace) {
      this.$router.push({ name: 'UserEditWorkspace', params: { slug: this.username, wsname: workspace.refName } });
    }
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'UserWorkspaces') {
        await this.fetchDataOnScroll();
      }
    }
  }
}
</script>

<style scoped>
</style>
