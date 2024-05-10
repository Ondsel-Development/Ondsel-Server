<template>
  <v-container class="d-flex flex-wrap justify-space-between" width="100%">
    <v-sheet class="ma-1">
      <span class="text-h6">User {{ userSum.name }}</span>
      <span v-if="promotionPossible" class="ms-2">
        <v-icon
          size="small"
          @click.stop="openEditPromotionDialog()"
          id="promotionButton"
        >mdi-bullhorn</v-icon>
        <v-tooltip
          activator="#promotionButton"
        >should {{selfPronoun}} promote this user</v-tooltip>
      </span>
      <span v-else class="ms-2">
        <v-icon
          size="small"
          color="grey"
          id="disabledPromotionButton"
        >mdi-bullhorn</v-icon>
        <v-tooltip
          v-if="!userCurrentOrganization"
          activator="#disabledPromotionButton"
        >must be logged in to promote anything</v-tooltip>
        <v-tooltip
          v-if="iAmThisUser"
          activator="#disabledPromotionButton"
        >cannot promote oneself</v-tooltip>
      </span>
      <p v-if="organization.description" class="text-lg-body-1">{{ organization.description }}</p>
    </v-sheet>
    <v-sheet class="ma-1" v-if="longDescriptionHtml">
      <v-card max-height="20em" style="overflow-y:auto;">
        <v-card-text>
          <markdown-viewer :markdown-html="longDescriptionHtml"></markdown-viewer>
        </v-card-text>
      </v-card>
    </v-sheet>
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
            <v-sheet
              class="mx-auto"
              link
              @click.stop="goToWorkspaceHome(workspace)"
            >
              <curated-item-sheet :curation="workspace.curation" />
            </v-sheet>
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
import {marked} from "marked";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import PromotionsViewer from "@/components/PromotionsViewer.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";

const { Workspace } = models.api;
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'UserHome',
  components: {CuratedItemSheet, MarkdownViewer, PromotionsViewer, EditPromotionDialog},
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
    ...mapGetters('app', ['selfPronoun', 'selfName']),
    targetUsername: vm => vm.$route.params.slug,
    userSum: vm => vm.userSumDetail,
    publicWorkspaces: vm => vm.publicWorkspacesDetail,
    iAmThisUser: vm => vm.userCurrentOrganization?.type === 'Personal' && vm.loggedInUser?.user?.username === vm.$route.params.slug,
    promotionPossible: vm => vm.userCurrentOrganization && !vm.iAmThisUser,
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
