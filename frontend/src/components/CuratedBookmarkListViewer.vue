<template>
  <v-sheet class="d-flex flex-wrap">
    <v-sheet
      v-for="entry in displayList"
      :key="entry.curation._id"
    >
      <v-sheet>
        <v-card
          elevation="8"
          min-width="22em"
          max-width="40em"
          class="ma-2 align-self-stretch"
          @click.stop="goToItem(entry)"
          :border="entry.read ? 'background xl' : 'info xl'"
        >
          <curated-item-sheet :curation="entry.curation" :message="entry.description" :from-user="entry.createdBy" :from-org="entry.onBehalfOf" :from-date="entry.createdAt"></curated-item-sheet>
        </v-card>
      </v-sheet>
      <v-sheet class="d-flex justify-space-between">
        <div>
        </div>
        <div>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                color="decoration"
                flat
                icon="mdi-dots-vertical"
                v-bind="props"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item @click="startEditDescription(entry)">
                <v-list-item-title><v-icon icon="mdi-pencil" class="mx-2"></v-icon> Edit Description</v-list-item-title>
              </v-list-item>
              <v-list-item @click="markReadState(entry, false)" v-if="entry.read">
                <v-list-item-title><v-icon icon="mdi-eye-minus" class="mx-2"></v-icon> Mark As Unseen</v-list-item-title>
              </v-list-item>
              <v-list-item @click="markReadState(entry, true)" v-if="!entry.read">
                <v-list-item-title><v-icon icon="mdi-eye-check" class="mx-2"></v-icon> Mark As Seen</v-list-item-title>
              </v-list-item>
              <v-list-item @click="remove(entry)">
                <v-list-item-title><v-icon icon="mdi-delete" class="mx-2"></v-icon> Remove</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-sheet>
    </v-sheet>
  </v-sheet>
  <v-sheet v-if="displayList.length === 0">
    <v-card class="ma8"><v-card-text><em>No Items Shared</em></v-card-text></v-card>
  </v-sheet>
  <edit-description-dialog ref="editDescription" @save-description="saveDescription"></edit-description-dialog>
</template>

<script>

import CuratedItemSheet from "@/components/CuratedItemSheet.vue";
import EditDescriptionDialog from "@/components/EditDescriptionDialog.vue";
import {models} from "@feathersjs/vuex";
import {mapGetters, mapState} from "vuex";
const { Organization, OrgSecondaryReference } = models.api;

export default {
  name: "CuratedBookmarkListViewer",
  components: {EditDescriptionDialog, CuratedItemSheet},
  props: {
    displayList: Array,
    allowEdits: {type: Boolean, default: false},
  },
  async created() {
    const user = this.loggedInUser.user;
    const org = await Organization.get(user.personalOrganization._id);
    this.orgSecondaryReferencesId = org.orgSecondaryReferencesId;
  },
  computed: {
    ...mapGetters('app', { organizationSummary: 'currentOrganization' }),
    ...mapState('auth', { loggedInUser: 'payload' }),
  },

  data: () => ({
    currentEntry: {},
    orgSecondaryReferencesId: null,
  }),
  methods: {
    async goToItem(entry) {
      await this.markReadState(entry, true);
      const curation = entry.curation;
      const nav = curation.nav;
      switch (nav.target) {
        case 'workspaces':
          if (nav.username) {
            this.$router.push({ name: 'UserWorkspaceHome', params: { slug: nav.username, wsname: nav.wsname } });
          } else {
            this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: nav.orgname, wsname: nav.wsname } });
          }
          break;
        case 'organizations':
          this.$router.push({ name: 'OrganizationHome', params: { slug: nav.orgname } });
          break;
        case 'users':
          this.$router.push({ name: 'UserHome', params: { slug: nav.username } });
          break;
        case 'shared-models':
          this.$router.push({ name: 'Share', params: { id: nav.sharelinkid } })
          break;
        case 'models':
          this.$router.push({ name: 'Home', params: { id: nav.modelid } })
          break;
        case 'ondsel': // not sure why this would ever show up; but for completeness...
          this.$router.push({ name: 'LensHome' } )
          break;
      }
    },
    async saveDescription() {
      const newDescription = this.$refs.editDescription.$data.newDescription;
      await OrgSecondaryReference.patch(
        this.orgSecondaryReferencesId,
        {
          "shouldEditShare": true,
          "bookmark": {
            "collectionName": this.currentEntry.collectionName,
            "collectionId": this.currentEntry.collectionSummary._id,
            description: newDescription,
          }
        }
      )
      this.$refs.editDescription.$data.dialog = false;
    },
    async startEditDescription(entry) {
      this.currentEntry = entry;
      this.$refs.editDescription.$data.newDescription = entry.description;
      this.$refs.editDescription.$data.dialog = true;
    },
    async remove(entry) {
      await OrgSecondaryReference.patch(
        this.orgSecondaryReferencesId,
        {
          "shouldRemoveShare": true,
          "bookmark": {
            "collectionName": entry.collectionName,
            "collectionId": entry.collectionSummary._id,
          }
        }
      )
    },
    async markReadState(entry, desiredState) {
      if (entry.read !== desiredState) {
        await OrgSecondaryReference.patch(
          this.orgSecondaryReferencesId,
          {
            "shouldEditShare": true,
            "bookmark": {
              "collectionName": entry.collectionName,
              "collectionId": entry.collectionSummary._id,
              read: desiredState,
            }
          }
        )
      } else {
        console.log(`minor err: already in ${desiredState} state!`);
      }
    }
  },
}
</script>

<style scoped>

</style>
