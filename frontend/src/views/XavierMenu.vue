<template>
  <v-sheet>
    <v-btn
      density="default"
      icon="mdi-home"
      color="success"
      class="ml-12"
    ></v-btn>
  </v-sheet>

  <v-card class="ma-4">
    <v-card-title>Professor Xavier's School For The Hidden</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item>
          <v-list-item-title
            @click="$router.push({ name: 'XavierModifyLensHomePageCuration', params: {} })"
          >
            <v-btn icon="mdi-gesture-tap"></v-btn> Modify Lens Home Page Curation
          </v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>
            View/Modify Key Documents:
            <v-list class="ms-4">
              <v-list-item>
                <v-list-item-title
                  @click="$router.push({ name: 'XavierUpdateKeyDocuments', params: {name: 'privacy-policy'} })"
                >
                  <v-btn icon="mdi-gesture-tap"></v-btn> Privacy Policy Document
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title
                  @click="$router.push({ name: 'XavierUpdateKeyDocuments', params: {name: 'terms-of-service'} })"
                >
                  <v-btn icon="mdi-gesture-tap"></v-btn> Terms of Service/Use
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title
            @click="$router.push({ name: 'XavierRemoveUser', params: {} })"
          >
            <v-btn icon="mdi-gesture-tap"></v-btn> Remove User
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-btn
        icon
        @click="$refs.searchPopupDialogXavier.$data.dialog = true;"
      >
        <v-icon>mdi-magnify</v-icon>
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
