<template>
  <v-container v-if="organization">
    <v-row class="align-center">
      <div class="text-h6">Workspaces</div>
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
    <template v-else-if="workspaces.data.length === paginationData[orgId].total">
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

const { Organization, Workspace } = models.api;

export default {
  name: 'OrganizationHome',
  components: { CreateWorkspaceDialog },
  data: () => ({
    paginationData: {},
  }),
  async created() {
    this.initPagination(this.orgId);
    await Organization.get(this.orgId);
    const org = await Organization.getFromStore(this.orgId);
    await this.setCurrentOrganization(org);
  },
  async mounted() {
    await this.fetchWorkspaces();
    window.addEventListener('scroll', () => {
      if(document.documentElement.scrollHeight <= window.scrollY + window.innerHeight + 1) {
        this.fetchWorkspaces();
      }
    });
  },
  computed: {
    ...mapState('workspaces', ['isFindPending']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    orgId: vm => vm.$route.params.id,
    organization: vm => Organization.getFromStore(vm.orgId),
    workspaces: vm => Workspace.findInStore({ query: { organizationId: vm.orgId } })
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
      if (this.isFindPending) {
        return;
      }
      this.initPagination(this.orgId);
      if (this.workspaces.data.length !== this.paginationData[this.orgId].total) {
        const workspaces = await Workspace.find({
          query: {
            $limit: this.paginationData[this.orgId].limit,
            $skip: this.paginationData[this.orgId].skip,
            organizationId: this.orgId,
          }
        });
        this.paginationData[this.orgId].skip = workspaces.skip + this.paginationData[this.orgId].limit;
        this.paginationData[this.orgId].total = workspaces.total;
      }
    },
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'WorkspaceHome', params: { id: workspace._id } });
    }
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationHome') {
        this.fetchWorkspaces();
      }
    }
  }
}
</script>

<style scoped>
</style>
