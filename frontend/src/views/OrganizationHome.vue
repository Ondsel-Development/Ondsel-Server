<template>
  <v-container>
    <v-row class="align-center">
      <v-col cols="5">
        Organization {{ organization.name }}
        <v-icon
          v-if="userCurrentOrganization"
          size="small"
          @click.stop="openEditPromotionDialog()"
        >mdi-bullhorn</v-icon>
        <p v-if="organization.description" class="text-lg-body-1">{{ organization.description }}</p>
        <p class="text-sm-body-2"><i>{{natureDetails}}</i></p>
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
        <v-row v-if="!publicWorkspaces || publicWorkspaces.length === 0">
          <i>no public workspaces</i>
        </v-row>
      </v-card-text>
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
const { Workspace } = models.api;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'OrganizationHome',
  components: {PromotionsViewer, EditPromotionDialog, ReprViewer},
  data: () => ({
    targetOrgDetail: {name: 'locating...'},
    publicWorkspacesDetail: [],
    natureDetails: 'tbd',
    promotedItemsDetail: [],
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
    if (this.targetOrgDetail.type==='Open') {
      this.natureDetails = `An open organization created on ${this.dateFormat(this.targetOrgDetail.createdAt)}.`
    } else {
      this.natureDetails = `A private organization created on ${this.dateFormat(this.targetOrgDetail.createdAt)}.`
    }
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    targetOrgName: vm => vm.$route.params.slug,
    organization: vm => vm.targetOrgDetail,
    iAmThisOrg: vm => (vm.userCurrentOrganization !== undefined) && (vm.userCurrentOrganization?.refName === vm.targetOrgName),
    promotedItems: vm => vm.promotedItemsDetail,
    publicWorkspaces: vm => vm.publicWorkspacesDetail,
    longDescriptionHtml: vm => marked(vm.organization?.curation?.longDescriptionMd || ""),
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    async goToWorkspaceHome(workspace) {
      this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: this.organization.refName, wsname: workspace.refName } });
    },
    async openEditPromotionDialog() {
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
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
