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
      <v-card-subtitle>
        <span v-if="decisionToPromote">Currently promoting.</span>
        <span v-else>Not currently promoting.</span>
      </v-card-subtitle>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="editTagsDialogForm" @submit.prevent="isPatchPending">
        <v-card>
          <v-card-text>
            <v-text-field
              v-model.trim="comment"
              label="Optional Comment (seen publicly)"
              hint="Enter optional public comment"
            ></v-text-field>
          </v-card-text>
        </v-card>
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
    await this.reCalc();
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
    // dummy: vm => vm.itemId + (vm.reCalc() || ''),
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async reCalc() {
      const org = await Organization.get(this.userCurrentOrganization._id);
      this.promoterType = 'organizations'; // only this for now; later adding "Ondsel" and possibly other promoters
                                           // note: a 'user' promotes using the Personal 'organizaton'
      this.promoterId = org._id.toString();
      this.promoterObj = org;
      if (this.userCurrentOrganization.type === 'Personal') {
        this.promoterName = `user ${this.user.name}`;
      } else {
        this.promoterName = `organization ${org.name}`;
      }
      const promoted = this.promoterObj.curation?.promoted || [];
      const pr = promoted.find(pr => pr.curation._id.toString() === this.itemId);
      if (pr) {
        this.decisionToPromote = true;
        if (this.comment === '') {
          this.comment = pr.notation.message;
        }
      } else {
        this.decisionToPromote = false;
      }
    },
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
  watch: {
    async dialog(newValue){
      if (newValue) {
        await this.reCalc();
      }
    }
  }
}
</script>
<style scoped>
</style>
