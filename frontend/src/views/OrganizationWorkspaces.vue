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
  name: 'OrganizationWorkspaces',
  components: { CreateWorkspaceDialog },
  data: () => ({
    paginationData: {},
  }),
  async created() {
    this.initPagination(this.orgName);
    try {
      await Organization.get(this.orgName);
    } catch (e) {
      if (e.data?.type === 'PermissionError') {
        console.log(this.orgName);
        console.log("PE");
        this.$router.push({ name: 'PageNotFound' });
      } else if (e.toString().startsWith('NotFound')) {
        console.log(this.orgName);
        console.log("NF");
        this.$router.push({ name: 'PageNotFound' });
      } else {
        console.log(e.data);
        console.log(e);
      }
    }
    // const org = await Organization.getFromStore(this.orgId);
    // console.log(org);
    // await this.setCurrentOrganization(org);
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
    orgName: vm => vm.$route.params.id,
    organization: vm => Organization.getFromStore(vm.orgName),
    workspaces: vm => Workspace.findInStore({ query: { "organization.refName": vm.orgName } })
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
      this.initPagination(this.orgName);
      if (this.workspaces.data.length !== this.paginationData[this.orgName].total) {
        const wsList = await Workspace.find({
          query: {
            $limit: this.paginationData[this.orgName].limit,
            $skip: this.paginationData[this.orgName].skip,
            "organization.refName": this.orgName,
          }
        });
        this.paginationData[this.orgName].skip = wsList.skip + this.paginationData[this.orgName].limit;
        this.paginationData[this.orgName].total = wsList.total;
      }
    },
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'WorkspaceHome', params: { id: workspace._id } });
    },
    async goToWorkspaceEdit(workspace) {
      this.$router.push({ name: 'EditWorkspace', params: { id: workspace._id } });
    }
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationWorkspaces') {
        this.fetchWorkspaces();
      }
    }
  }
}
</script>

<style scoped>
</style>
