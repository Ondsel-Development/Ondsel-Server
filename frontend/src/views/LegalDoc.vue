<template>
  <div v-if="legit_category">
    <v-card-subtitle>ver {{ specific_doc.version }}</v-card-subtitle>
    <v-card-text>
      <div v-html='markdown'></div>
    </v-card-text>
  </div>
    <div v-else>
      <v-card-text>
        There does not appear to be a legal document called '{{ category_name }}'.
      </v-card-text>
    </div>
</template>

<script>
import {models} from "@feathersjs/vuex";
import nmd from "nano-markdown";

export default {
  name: 'LegalDoc',
  components: { },
  data() {
    return {
      result: {},
      legit_category: ['privacy-policy', 'terms-of-service'].includes(this.$route.params.doc_name),
      category_name: this.$route.params.doc_name,
      specific_doc: {},
      markdown: '',
    }
  },
  computed: {
  },
  methods: {
  },
  created() {
    models.api.Agreements.find({
      query: {category: 'terms-of-service'}
    }).then(response => {
      const agreement = (response.data.length > 0) ? response.data[0] : {current:{markdownContent: 'doc missing'}};
      this.specific_doc = agreement.current;
      this.markdown =  nmd(this.specific_doc.markdownContent);
    });
  },
}
</script>

<style scoped>

</style>
