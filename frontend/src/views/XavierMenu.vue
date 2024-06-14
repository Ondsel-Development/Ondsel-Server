<template>
  <v-card class="ma-4">
    <v-card-title><v-sheet color="success">Professor Xavier's School For The Hidden</v-sheet></v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item>
          View/Modify Key Documents:
          <v-list class="ms-4">
            <v-list-item
              color="link"
              class="text-decoration-underline"
              @click="$router.push({ name: 'XavierUpdateKeyDocuments', params: {name: 'privacy-policy'} })"
            >
              Privacy Policy Document
            </v-list-item>
            <v-list-item
              color="link"
              class="text-decoration-underline"
              @click="$router.push({ name: 'XavierUpdateKeyDocuments', params: {name: 'terms-of-service'} })"
            >
              Terms of Service/Use
            </v-list-item>
          </v-list>
        </v-list-item>
        <v-list-item
          color="link"
          class="text-decoration-underline"
          @click="$router.push({ name: 'XavierRemoveUser', params: {} })"
        >
          Remove User
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-btn
        flat
        density="default"
        icon="mdi-magnify"
        @click="$refs.searchPopupDialogXavier.$data.dialog = true;"
      >
      </v-btn>
    </v-card-actions>
  </v-card>
  <search-popup-dialog ref="searchPopupDialogXavier" dest-page-name="XavierSearchResults"></search-popup-dialog>
</template>

<script>

import {mapState} from "vuex";
import SearchPopupDialog from "@/components/SearchPopupDialog.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierMenu',
  components: {SearchPopupDialog},
  data: () => ({
  }),
  async created() {
    if (!this.user || !this.user.isTripe) {
      console.log("alert-33234");
      this.$router.push({name: 'LensHome', params: {}});
    }
  },
  computed: {
    ...mapState('auth', ['user']),
  },
  methods: {
  },
  watch: {
  }
}
</script>
<style scoped>
</style>
