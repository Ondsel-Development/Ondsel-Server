<template>
  <v-dialog
    transition="dialog-top-transition"
    v-if="dialog"
    v-model="dialog"
    width="80em"
  >
    <v-card>
      <v-card-text>
        <v-form @submit.prevent>
          <v-text-field
            v-model="searchText"
            label="Search text"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          flat
        >Find</v-btn>
        <v-btn
          flat
          @click="dialog = false"
        >Close</v-btn>
      </v-card-actions>
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
  },
}
</script>
<style scoped>
</style>
