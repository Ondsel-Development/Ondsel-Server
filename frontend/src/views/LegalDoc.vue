<template>
  <div class="pa-3">
    <v-card
      v-if="legit_category"
      variant="outlined"
    >
      <v-card-subtitle>ver {{ specific_doc.version }}</v-card-subtitle>
      <v-card-text>
        <div v-html='markdown' class="pa-3"></div>
      </v-card-text>
    </v-card>
    <v-card
      v-else
      variant="outlined"
    >
        <v-card-text>
          There does not appear to be a legal document called '{{ category_name }}'.
        </v-card-text>
    </v-card>
    <v-divider></v-divider>
    <div v-if="legit_category">
      <h2>History</h2>
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Effective</th>
            <th>Deprecated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.version">
            <td>{{item.title}}</td>
            <td>{{item.version}}</td>
            <td>{{new Date(item.effective).toUTCString()}}</td>
            <td>{{item.deprecated ? new Date(item.deprecated).toUTCString() : "active"}}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script>
import {models} from "@feathersjs/vuex";
import {marked} from "marked";

export default {
  name: 'LegalDoc',
  components: { },
  data() {
    return {
      result: {},
      legit_category: ['privacy-policy', 'terms-of-service'].includes(this.$route.params.doc_name),
      category_name: this.$route.params.doc_name,
      specific_doc: {},
      history: [],
      markdown: '',
    }
  },
  computed: {
  },
  methods: {
  },
  created() {
    models.api.Agreements.find({
      query: {category: this.category_name}
    }).then(response => {
      const agreement = (response.data.length > 0) ? response.data[0] : {current:{markdownContent: 'doc missing'}};
      this.specific_doc = agreement.current;
      this.history = agreement.history ? agreement.history : [];
      this.markdown =  marked.parse(this.specific_doc.markdownContent);
    });
  },
}
</script>

<style scoped>

</style>
