<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card min-width="24em" max-width="48em">
      <v-card-title><div class="text-center">Create a Promotion via URL</div></v-card-title>
      <v-progress-linear
        :active="isCreatePending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form @submit.prevent="interpretUrlAndCreatePromotion">
        <v-card-text>
          <v-text-field
            v-model="url"
            label="URL"
            hint="Paste url of the page to promote"
            :disabled="isCreatePending"
          ></v-text-field>
          <v-text-field
            v-model="comment"
            label="Ondsel Official Public Comment"
            hint="add optional comment"
            :disabled="isCreatePending"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            @click="dialog = false"
          >Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="isCreatePending"
            :loading="isCreatePending"
            @click="interpretUrlAndCreatePromotion()"
          >Create</v-btn>
        </v-card-actions>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
    </v-card>
  </v-dialog>

</template>

<script>


import {mapActions} from "vuex";
import {removeNonPublicItems} from "@/curationHelpers";
import {models} from "@feathersjs/vuex";

const { SharedModel } = models.api;

export default {
  name: "CreateXavierPromotionFromUrl",
  props: {
    organization: Object,
  },
  emits: ['createPromotion'],
  data: () => ({
    dialog: false,
    comment: '',
    url: '',
    isCreatePendingDetail: false,
    snackerMsg: '',
    showSnacker: false,
  }),
  computed: {
    isCreatePending: vm => vm.isCreatePendingDetail,
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByNamePublic', 'getOrgByIdOrNamePublic']),
    async interpretUrlAndCreatePromotion() {
      this.isCreatePendingDetail = true;
      const urlParts = this.url.split("/");
      if (urlParts.length > 3) {
        const id = urlParts.pop();
        const category = urlParts.pop();
        let curation;
        let obj;
        let personalOrg;
        let orgRefName;
        let orgType;
        try {
          switch (category) {
            case 'user':
              obj = await this.getUserByIdOrNamePublic(id);
              personalOrg = await this.getOrgByIdOrNamePublic(obj._id.toString());
              curation = personalOrg.curation;
              break;
            case 'workspace':
              orgRefName = urlParts.pop();
              orgType = urlParts.pop();
              if (orgType === 'user') {
                obj = await this.getUserByIdOrNamePublic(orgRefName);
                orgRefName = obj._id.toString(); // orgname is userid when a user ws reference
              }
              obj = await this.getWorkspaceByNamePublic({wsName: id, orgName: orgRefName} )
              curation = obj.curation;
              break;
            case 'org':
              obj = await this.getOrgByIdOrNamePublic(id);
              curation = obj.curation;
              break;
            case 'share':
              obj = await SharedModel.get(id, {query: {isActive: true}});
              curation = obj.curation;
              break;
            default:
              break;
          }
        } catch (e) {
          console.log(e)
        }
        if (curation) {
          removeNonPublicItems(curation);
          this.$emit('createPromotion', curation, this.comment);
          this.dialog = false;
        } else {
          this.snackerMsg = 'could not interpret url';
          this.showSnacker = true;
        }
      } else {
        this.snackerMsg = 'url not complete enough';
        this.showSnacker = true;
      }
      this.isCreatePendingDetail = false;
    }
  }
}
</script>

<style scoped>

</style>
