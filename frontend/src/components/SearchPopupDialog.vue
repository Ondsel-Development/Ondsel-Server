<template>
  <v-dialog
    transition="dialog-top-transition"
    v-if="dialog"
    v-model="dialog"
    width="80em"
  >
    <v-card>
      <v-form @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="searchText"
            autofocus
            label="Search text"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="dialog = false"
          >Close</v-btn>
          <v-btn
            color="primary"
            type="submit"
            @click="doSearch()"
          >Find</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'searchPopupDialog',
  props: {
  },
  created() {
  },
  data: () => ({
    dialog: false,
    searchText: '',
  }),
  computed: {
  },
  methods: {
    doSearch() {
      this.$router.push({ name: 'SearchResults', params: { text: this.searchText } });
      this.dialog = false;
    }
  },
}
</script>
<style scoped>
</style>
