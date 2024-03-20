<template>
  <v-card class="ma-4">
    <v-card-title>Professor Xavier's School For The Hidden</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item>
          <v-list-item-title
            @click="$router.push({ name: 'XavierModifyLensHomePageCuration', params: {} })"
          >
            Modify Lens Home Page Curation
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>

import {mapState} from "vuex";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierMenu',
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
