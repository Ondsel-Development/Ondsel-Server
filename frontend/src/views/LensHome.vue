<template>
  <v-container>
    <v-card>
      <v-card-title>LENS</v-card-title>
      <v-card-text>
        <div v-html="markdownHtml"></div>
      </v-card-text>
    </v-card>
    <v-card class="mt-4">
      <v-card-text>
        <promotions-viewer :promoted="promoted"></promotions-viewer>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {models} from "@feathersjs/vuex";
import {marked} from "marked";
import PromotionsViewer from "@/components/PromotionsViewer.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'LensHome',
  components: {PromotionsViewer},
  data: () => ({
    lensSiteCuration: {},
    markdownHtml: 'missing data',
    promoted: [],
  }),
  async created() {
    models.api.Agreements.find({
      query: {category: 'lens-site-curation'}
    }).then(response => {
      if (response.data.length > 0) {
        this.lensSiteCuration = response.data[0];
        this.markdownHtml =  marked.parse(this.lensSiteCuration.current.markdownContent);
        this.promoted = this.lensSiteCuration.current.curation.promoted || []
        console.log(this.lensSiteCuration);
      }
    });
  },
  async mounted() {
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
