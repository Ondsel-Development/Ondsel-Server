<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">Organization {{ organization.name }}</div>
      <v-spacer />
    </v-row>
    <v-spacer />
  </v-container>
  <v-container>
    <p>Full Name: <b>{{ organization.name }}</b></p>
    <p>Nature: <code>{{organization.type}}</code></p>
  </v-container>
  <v-container>
    <v-card elevation="0">
      <v-card-title>Public Workspaces</v-card-title>
      <v-card-text>
        <v-row class="mt-6">
          <v-col
            cols="6"
            v-for="workspace in publicWorkspaces"
            :key="workspace._id"
          >
            <v-card
              class="mx-auto"
              variant="elevated"
              link
              @click.stop="goToWorkspaceHome(workspace)"
            >
              <template #title>
                <div class="text-h6">{{ workspace.name }} <span class="text-body-2">({{ workspace.description }})</span></div>
              </template>
              <template #subtitle>
                <div class="text-body-2">{{ (new Date(workspace.createdAt)).toDateString() }}</div>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
const { Workspace } = models.api;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'OrganizationHome',
  components: { },
  data: () => ({
    targetOrgDetail: {name: 'locating...'},
    publicWorkspacesDetail: [],
  }),
  async mounted() {
    this.targetOrgDetail = await this.getOrgByIdOrNamePublic(this.targetOrgName);
    if (!this.targetOrgDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
    if (this.targetOrgDetail.type === 'Personal') {
      // if using viewing a 'personal' org, this is the wrong place. Send to the user home page which shows the personal org instead.
      this.$router.push({ name: 'UserHome', params: { slug: this.targetOrgDetail.owner.username } });
      return;
    }
    const wsList = await Workspace.find({
      query: {
        "organization.refName": this.organization.refName,
        publicInfo: 'true',
      }
    })
    this.publicWorkspacesDetail = wsList.data;
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    targetOrgName: vm => vm.$route.params.slug,
    organization: vm => vm.targetOrgDetail,
    iAmThisOrg: vm => (vm.userCurrentOrganization !== undefined) && (vm.userCurrentOrganization?.refName === vm.targetOrgName),
    publicWorkspaces: vm => vm.publicWorkspacesDetail,
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: this.organization.refName, wsname: workspace.refName } });
    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationHome') {
        this.targetOrgDetail = await this.getOrgByIdOrNamePublic(this.targetOrgName);
      }
    }
  }
}
</script>
<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
