<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">User {{ userSum.name }}</div>
      <v-spacer />
    </v-row>
    <v-spacer />
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
              <template v-slot:prepend>
                <repr-viewer :curation="workspace.curation"/>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import ReprViewer from "@/components/ReprViewer.vue";

const { Workspace } = models.api;
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'UserHome',
  components: {ReprViewer},
  data: () => ({
    userSumDetail: {name: 'locating...', username: ''},
    publicWorkspacesDetail: [],
  }),
  async mounted() {
    this.userSumDetail = await this.getUserByIdOrNamePublic(this.targetUsername);
    if (!this.userSumDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
    const wsList = await Workspace.find({
      query: {
        "organization.refName": this.userSumDetail._id.toString(),
        publicInfo: 'true',
      }
    })
    this.publicWorkspacesDetail = wsList.data;
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    targetUsername: vm => vm.$route.params.slug,
    userSum: vm => vm.userSumDetail,
    publicWorkspaces: vm => vm.publicWorkspacesDetail,
    iAmThisUser: vm => vm.loggedInUser?.user?.username === vm.$route.params.slug,
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getOrgByIdOrNamePublic']),
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'UserWorkspaceHome', params: { slug: this.userSum.username, wsname: workspace.refName } });
    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'UserHome') {
        this.userSumDetail = await this.getUserByIdOrNamePublic(this.targetUsername);
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
