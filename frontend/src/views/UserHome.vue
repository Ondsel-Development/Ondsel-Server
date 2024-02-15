<template>
  <v-container>
    <v-row class="align-center">
      <v-col cols="5">
        <div class="text-h6">User {{ userSum.name }}</div>
        <v-icon
          v-if="userCurrentOrganization"
          size="small"
          @click.stop="openEditPromotionDialog()"
        >mdi-bullhorn</v-icon>
        <p v-if="organization.description" class="text-lg-body-1">{{ organization.description }}</p>
      </v-col>
      <v-col cols="7">
        <v-card max-height="200" overflow-y-visible>
          <v-card-text>
            <div v-html="longDescriptionHtml"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>

  <v-container>
    <v-card elevation="0" v-if="(organization.curation?.promoted || []).length > 0">
      <v-card-title>Items {{userSum.name}} thinks you would like</v-card-title>
      <v-card-text>
        <promotions-viewer :promoted="organization.curation.promoted" />
      </v-card-text>
    </v-card>

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
  <edit-promotion-dialog v-if="userCurrentOrganization" ref="editPromotionDialog" collection="users" :item-id="userSum._id" :item-name="userSum.name"></edit-promotion-dialog>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import ReprViewer from "@/components/ReprViewer.vue";
import {marked} from "marked";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import PromotionsViewer from "@/components/PromotionsViewer.vue";

const { Workspace } = models.api;
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'UserHome',
  components: {PromotionsViewer, EditPromotionDialog, ReprViewer},
  data: () => ({
    userSumDetail: {name: 'locating...', username: ''},
    organizationDetail: {},
    publicWorkspacesDetail: [],
  }),
  async mounted() {
    await this.refresh();
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    targetUsername: vm => vm.$route.params.slug,
    userSum: vm => vm.userSumDetail,
    publicWorkspaces: vm => vm.publicWorkspacesDetail,
    iAmThisUser: vm => vm.loggedInUser?.user?.username === vm.$route.params.slug,
    organization: vm => vm.organizationDetail,
    longDescriptionHtml: vm => marked(vm.organization?.curation?.longDescriptionMd || ""),
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getOrgByIdOrNamePublic']),
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'UserWorkspaceHome', params: { slug: this.userSum.username, wsname: workspace.refName } });
    },
    async openEditPromotionDialog() {
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
    async refresh() {
      this.userSumDetail = await this.getUserByIdOrNamePublic(this.targetUsername);
      if (!this.userSumDetail) {
        this.$router.push({ name: 'PageNotFound' });
      }
      this.organizationDetail = await this.getOrgByIdOrNamePublic(this.userSumDetail._id.toString());
      const wsList = await Workspace.find({
        query: {
          "organization.refName": this.userSumDetail._id.toString(),
          publicInfo: 'true',
        }
      })
      this.publicWorkspacesDetail = wsList.data;
    }
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'UserHome') {
        await this.refresh();
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
