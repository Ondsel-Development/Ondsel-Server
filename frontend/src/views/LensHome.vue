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
        <promotions-viewer :promoted="promotedFiltered"></promotions-viewer>
      </v-card-text>
    </v-card>
    <v-card v-if="promotedUsers && promotedUsers.length" flat>
      <v-card-title>Users</v-card-title>
      <promoted-users-table :promoted-users="promotedUsers" />
    </v-card>
  </v-container>
</template>

<script>

import {models} from "@feathersjs/vuex";
import {marked} from "marked";
import PromotionsViewer from "@/components/PromotionsViewer.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import PromotedUsersTable from "@/components/PromotedUsersTable.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'LensHome',
  components: {PromotedUsersTable, MarkdownViewer, PromotionsViewer},
  data: () => ({
    lensSiteCuration: null,
    markdownHtml: 'missing data',
    title: 'missing title',
  }),
  async created() {
    const response = await models.api.Agreements.find({
      query: {category: 'lens-site-curation'}
    });
    if (response.data.length > 0) {
      this.lensSiteCuration = response.data[0];
      this.markdownHtml =  marked.parse(this.lensSiteCuration.current.markdownContent);
      this.title = this.lensSiteCuration.current.curation.description || '';
    }
  },
  computed: {
    promoted: vm => vm.lensSiteCuration && vm.lensSiteCuration.current.curation.promoted || [],
    promotedFiltered: vm => vm.lensSiteCuration && vm.lensSiteCuration.current.curation.promoted.filter(p => p.curation.collection !== 'users') || [],
    promotedUsers: vm => vm.lensSiteCuration && vm.lensSiteCuration.current.curation.promoted.filter(p => p.curation.collection === 'users'),
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
