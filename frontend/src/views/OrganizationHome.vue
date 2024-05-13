<template>
  <v-container class="d-flex flex-wrap">
    <v-sheet class="ma-1">
      <span class="text-h6">Organization {{ organization.name }} &nbsp;</span>
      <span v-if="promotionPossible" class="ms-2">
        <v-icon
          size="small"
          @click.stop="openEditPromotionDialog()"
          id="promotionButton"
        >mdi-bullhorn</v-icon>
        <v-tooltip
          activator="#promotionButton"
        >should {{selfPronoun}} promote this organization</v-tooltip>
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
          v-if="iAmThisOrg"
          activator="#disabledPromotionButton"
        >{{selfPronoun}} cannot self-promote {{selfName}}</v-tooltip>
      </span>
      <p v-if="organization.description" class="text-lg-body-1">{{ organization.description }}</p>
      <p class="text-sm-body-2"><i>{{natureDetails}}</i></p>
    </v-sheet>
    <v-sheet class="ma-1" v-if="longDescriptionHtml">
      <v-card min-width="22em" max-height="20em" style="overflow-y:auto;">
        <v-card-text>
          <markdown-viewer :markdown-html="longDescriptionHtml"></markdown-viewer>
        </v-card-text>
      </v-card>
    </v-sheet>
  </v-container>
  <v-container>
    <v-card elevation="0" v-if="(organization.curation?.promoted || []).length > 0">
      <v-card-title>Items we think you would like</v-card-title>
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
              <curated-item-sheet :curation="workspace.curation"></curated-item-sheet>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-if="!publicWorkspaces || publicWorkspaces.length === 0">
      <v-card-subtitle>
        no public workspaces yet
      </v-card-subtitle>
    </v-card>

    <v-card elevation="0" v-if="organization.type === 'Open'">
      <v-card-title>Membership</v-card-title>
      <v-card-text>
        <v-row class="mt-6">
          <v-col
            cols="6"
            v-for="member in organization.users"
            :key="member._id"
          >
            <v-sheet
              class="mx-auto"
              elevated
              link
              @click.stop="goToUserHome(member)"
            >
              <curated-item-sheet :curation="member.curation"></curated-item-sheet>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-if="organization.type === 'Private'">
      <v-card-subtitle>
        membership not visible in Private organizations
      </v-card-subtitle>
    </v-card>
  </v-container>
  <edit-promotion-dialog v-if="userCurrentOrganization" ref="editPromotionDialog" collection="organizations" :item-id="organization._id" :item-name="organization.name"></edit-promotion-dialog>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import ReprViewer from "@/components/ReprViewer.vue";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import {marked} from "marked";
import PromotionsViewer from "@/components/PromotionsViewer.vue";
import CuratedItemSheet from "@/components/CuratedItemSheet.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
const { Workspace } = models.api;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'OrganizationHome',
  components: {MarkdownViewer, CuratedItemSheet, PromotionsViewer, EditPromotionDialog},
  data: () => ({
    targetOrgDetail: {name: 'locating...'},
    publicWorkspacesDetail: [],
    natureDetails: 'tbd',
    promotedItemsDetail: [],
  }),
  async mounted() {
    await this.refresh();
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    ...mapGetters('app', ['selfPronoun', 'selfName']),
    targetOrgName: vm => vm.$route.params.slug,
    organization: vm => vm.targetOrgDetail,
    iAmThisOrg: vm => (vm.userCurrentOrganization !== undefined) && (vm.userCurrentOrganization?.refName === vm.targetOrgName),
    promotionPossible: vm => vm.userCurrentOrganization && !vm.iAmThisOrg,
    promotedItems: vm => vm.promotedItemsDetail,
    publicWorkspaces: vm => vm.publicWorkspacesDetail,
    longDescriptionHtml: vm => marked(vm.organization?.curation?.longDescriptionMd || ""),
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: this.organization.refName, wsname: workspace.refName } });
    },
    async goToUserHome(member) {
      this.$router.push({ name: 'UserHome', params: { slug: member.username } });
    },
    async openEditPromotionDialog() {
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    async refresh() {
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
      if (this.targetOrgDetail.type==='Open') {
        this.natureDetails = `An open organization created on ${this.dateFormat(this.targetOrgDetail.createdAt)}.`
      } else {
        this.natureDetails = `A private organization created on ${this.dateFormat(this.targetOrgDetail.createdAt)}.`
      }
      // mimic a list of curations for the membership for easier display
      for (const index in this.targetOrgDetail.users) {
        const user = this.targetOrgDetail.users[index];
        let description = user.isAdmin ? 'administrator' : 'member';
        const fakeCuration = {
          _id: user._id,
          collection: 'users',
          name: user.name,
          description: description,
          representativeFile: null,
        }
        this.targetOrgDetail.users[index].curation = fakeCuration
      }
    }
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationHome') {
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
