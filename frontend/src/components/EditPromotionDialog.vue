<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="800" max-height="800">
      <template v-slot:title>
        <div class="text-center">Should {{promoterName}} promote "{{itemName}}"</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="editTagsDialogForm" @submit.prevent="isPatchPending">
        <v-text-field
          v-model.trim="comment"
          label="Optional Comment (seen publicly)"
          hint="Enter optional public comment"
        ></v-text-field>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn @click="editPromotion(true)" color="primary" :disabled="isPatchPending">Yes</v-btn>
        <v-btn @click="editPromotion(false)" color="primary" :disabled="isPatchPending">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {mapActions, mapGetters, mapState} from "vuex";
import {models} from "@feathersjs/vuex";

const { Organization } = models.api;

export default {
  name: 'EditPromotionDialog',
  props: {
    collection: String,
    itemId: String,
    itemName: String,
  },
  async created() {
    this.promoterType = 'organizations'; // only this for now; later adding "Ondsel" and possibly other promoters
    this.promoterId = this.userCurrentOrganization._id.toString();
    this.promoterObj = this.userCurrentOrganization;
    if (this.userCurrentOrganization.type === 'Personal') {
      this.promoterName = `user ${this.user.name}`;
    } else {
      this.promoterName = `organization ${this.userCurrentOrganization.name}`;
    }
  },
  data: () => ({
    dialog: false,
    comment: '',
    decisionToPromote: false,
    snackerMsg: '',
    showSnacker: false,
    isPatchPending: false,
    promoterName: 'tbd',
    promoterObj: null,
    promoterType: null,
    promoterId: null,
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async editPromotion(decision) {
      let obj;
      let curation;
      switch (this.collection) {
        case 'workspaces':
          obj = await this.getWorkspaceByIdPublic(this.itemId);
          curation = {
            _id: this.itemId,
            collection: this.collection,
            name: obj.name,
            description: obj.description || '',
          };
          await this.applyChange(decision, curation);
          break;
        case 'organizations':
          obj = await this.getOrgByIdOrNamePublic(this.itemId);
          curation = {
            _id: this.itemId,
            collection: this.collection,
            name: obj.name,
            description: obj.description || '',
          };
          await this.applyChange(decision, curation);
          break;
        case 'users':
          obj = await this.getUserByIdOrNamePublic(this.itemId);
          curation = {
            _id: this.itemId,
            collection: this.collection,
            name: obj.name,
            description: obj.description || '',
          };
          await this.applyChange(decision, curation);
          break;
        default:
          console.log(`unknown collection ${this.collection}`); // should not happen
          break;
      }
      this.dialog = false;
    },
    async applyChange(decision, curation) {
      let promoterCuration = this.promoterObj.curation;
      let promoted = promoterCuration.promoted || [];
      if (decision === true) {
        // upsert the item
        const newPr = {
          notation: {
            updatedAt: Date.now(),
            historicUser: {
              _id: this.user._id,
              username: this.user.username,
              name: this.user.name,
              tier: this.user.tier,
            },
            message: this.comment,
          },
          curation: curation,
        }
        const index = promoted.findIndex(pr => pr.curation._id.toString() === curation._id.toString());
        if (index >= 0) {
          promoterCuration.promoted[index] = newPr;
        } else {
          promoterCuration.promoted.push(newPr);
        }
      } else {
        // remove the item
        promoterCuration.promoted = promoted.filter(pr => pr.curation._id.toString() !== curation._id.toString())
      }
      switch (this.promoterType) {
        case 'organizations':
          await Organization.patch(
            this.promoterId,
            {
              curation: promoterCuration,
            }
          )
          break;
        default:
          console.log(`unknown promoter type ${this.promoterType}`);
          break;
      }
    }
  },
}
</script>
<style scoped>
</style>
