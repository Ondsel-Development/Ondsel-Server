<template>
  <v-card class="ma-4">
    <v-card-title>Update Key Document: {{docName}}</v-card-title>
    <v-card-subtitle>Professor Xavier's School For The Hidden</v-card-subtitle>
    <v-card-text>
      <v-list lines="three">
        <v-list-subheader><i>All Changes Are Public</i></v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Text Body (markdown)</v-list-item-title>
          <v-list-item-media class="flex d-flex flex-wrap">
            <v-card border="primary md" max-width="40em" class="ma-2">
              <v-card-text>
                <markdown-viewer :markdown-html="markdownHtml"></markdown-viewer>
              </v-card-text>
            </v-card>
            <v-card max-width="60em" class="ma-2">
              <v-card-text border="primary md">
                <pre style="overflow-x: auto;">{{lensSiteDocument?.current?.markdownContent}}</pre>
              </v-card-text>
            </v-card>
          </v-list-item-media>
          <v-list-item-action class="justify-end">
            <v-btn
              class="ma-2"
              @click.stop="$refs.editLongDescriptionMd.$data.dialog=true"
            >
              Edit
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Document Version</v-list-item-title>
          <v-list-item-subtitle>last: {{ lensSiteDocument?.current?.version }} effective {{ dateFormat(lensSiteDocument?.current?.effective) }}</v-list-item-subtitle>
          <v-list-item-media>
            <v-card>
              <v-card-text>
                <v-data-table :headers="versionHeaders" :items="history"></v-data-table>
              </v-card-text>
            </v-card>
          </v-list-item-media>
        </v-list-item>
      </v-list>

    </v-card-text>
  </v-card>

  <edit-long-description-md-dialog ref="editLongDescriptionMd" :long-description-md="lensSiteDocument?.current?.markdownContent" @save-long-description-md="saveLongDescriptionMd"></edit-long-description-md-dialog>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {marked} from "marked";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import EditLongDescriptionMdDialog from "@/components/EditLongDescriptionMdDialog.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierUpdateKeyDocuments',
  components: {EditLongDescriptionMdDialog, MarkdownViewer},
  data: () => ({
    lensSiteDocument: {},
    markdownHtml: 'missing data',
    history: [],
    versionHeaders: [
      {
        title: 'Version',
        key: 'version',
        value: 'version',
      },
      {
        title: 'When',
        key: 'date',
        value: 'date',
      },
    ]
  }),
  async created() {
    if (!this.user || !this.user.isTripe) {
      console.log("alert-7492783-mlhpc");
      this.$router.push({name: 'LensHome', params: {}});
    }
    await this.update();
  },
  computed: {
    ...mapState('auth', ['user']),
    docName: vm => vm.$route.params.name,
  },
  methods: {
    update() {
      models.api.Agreements.find({
        query: {category: this.docName}
      }).then(response => {
        if (response.data.length > 0) {
          this.lensSiteDocument = response.data[0];
          this.markdownHtml =  marked.parse(this.lensSiteDocument.current.markdownContent);
          let newHistory = [];
          for (const h of this.lensSiteDocument.history) {
            newHistory.push({
              version: h.version,
              date: this.dateFormat(h.effective),
            })
          }
          this.history = newHistory;
        }
      });
    },
    async saveLongDescriptionMd() {
      let newCurrent = this.lensSiteDocument.current;
      newCurrent.markdownContent = this.$refs.editLongDescriptionMd.$data.newLongDescriptionMd;
      await this.lensSiteDocument.patch({
        current: newCurrent,
      })
      this.update();
      this.$refs.editLongDescriptionMd.$data.dialog = false;
    },
    async takeSnapshot() {
      let newCurrent = { ...this.lensSiteDocument.current};
      let newHistory = this.lensSiteDocument.history;
      let now = Date.now();
      // deprecate the old
      const lastIndex = newHistory.length - 1;
      newHistory[lastIndex].deprecated = now;
      // add the new
      newCurrent.agreementDocId = this.newObjectId();
      newCurrent.effective = now;
      newCurrent.docPostedAt = now;
      newCurrent.version = this.$refs.takeSnapshotDialog.$data.newDescription;
      newHistory.push(newCurrent);
      await models.api.Agreements.patch(
        this.lensSiteDocument._id.toString(),
        {
          current: newCurrent,
          history: newHistory,
        }
      );
      this.update();
      this.$refs.takeSnapshotDialog.$data.dialog = false;
    },
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    newObjectId() {
      // credit: https://stackoverflow.com/a/68685738
      const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
      const objectId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
      }).toLowerCase();
      return objectId;
    }
  },
  watch: {
  }
}
</script>
<style scoped>
</style>
