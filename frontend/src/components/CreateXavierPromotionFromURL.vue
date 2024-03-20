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
      <v-form @submit.prevent="isCreatePending">
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
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
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
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async interpretUrlAndCreatePromotion() {
      this.isCreatePendingDetail = true;
      const urlParts = this.url.split("/");
      console.log(urlParts);
      if (urlParts.length > 3) {
        const id = urlParts.pop();
        const category = urlParts.pop();
        let curation;
        let obj;
        switch (category) {
          case 'user':
            obj = await this.getUserByIdOrNamePublic(id);
            curation = {
              _id: obj._id,
              collection: 'users',
              name: obj.name,
              description: obj.description || '',
            };
            break;
          default:
            break;
        }
        this.$emit('createPromotion', curation, this.comment);
        this.dialog = false;
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
