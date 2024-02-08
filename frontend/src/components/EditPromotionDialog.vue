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

export default {
  name: 'EditPromotionDialog',
  props: {
    collection: String,
    itemId: String,
    itemName: String,
  },
  async created() {
    if (this.userCurrentOrganization.type === 'Personal') {
      this.promoterType = 'users';
      this.promoterId = this.user._id.toString();
      this.promoterName = `user ${this.user.name}`;
    } else {
      this.promoterType = 'organizations';
      this.promoterId = this.userCurrentOrganization._id.toString();
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
    promoterType: null,
    promoterId: null,
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    async editPromotion(decision) {
      console.log(decision);
    },
  },
}
</script>
<style scoped>
</style>
