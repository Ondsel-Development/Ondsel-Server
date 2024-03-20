<template>
  <v-container class="ma-2">
    <v-container>
      <h2>LENS</h2>
    </v-container>
    <v-card class="ma-4">
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <markdown-viewer :markdown-html="markdownHtml"></markdown-viewer>
      </v-card-text>
    </v-card>
    <v-card class="ma-4">
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
import MarkdownViewer from "@/components/MarkdownViewer.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'LensHome',
  components: {MarkdownViewer, PromotionsViewer},
  data: () => ({
    lensSiteCuration: {},
    markdownHtml: 'missing data',
    title: 'missing title',
    promoted: [],
  }),
  async created() {
    models.api.Agreements.find({
      query: {category: 'lens-site-curation'}
    }).then(response => {
      if (response.data.length > 0) {
        this.lensSiteCuration = response.data[0];
        this.markdownHtml =  marked.parse(this.lensSiteCuration.current.markdownContent);
        this.promoted = this.lensSiteCuration.current.curation.promoted || [];
        this.title = this.lensSiteCuration.current.curation.description || '';
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
