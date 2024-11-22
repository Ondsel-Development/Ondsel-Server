<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-card class="ma-4">
    <v-card-title>Update Key Document: {{docName}}</v-card-title>
    <v-card-subtitle>
      <v-btn
        density="default"
        icon="mdi-home"
        color="success"
        @click="$router.push({ name: 'XavierMenu', params: {}})"
      ></v-btn> <b><i>Professor Xavier's School For The Hidden</i></b>
    </v-card-subtitle>
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
                <pre style="overflow-x: auto;">{{markdownContent}}</pre>
              </v-card-text>
            </v-card>
          </v-list-item-media>
          <v-list-item-action class="justify-end">
            <v-btn
              color="error"
              variant="elevated"
              class="ma-2"
              @click.stop="$refs.editKeyDocument.$data.dialog=true"
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

  <edit-key-document-dialog ref="editKeyDocument" :markdown="markdownContent" @save-key-document="saveKeyDocument"></edit-key-document-dialog>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {marked} from "marked";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import EditKeyDocumentDialog from "@/components/EditKeyDocumentDialog.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierUpdateKeyDocuments',
  components: {EditKeyDocumentDialog, MarkdownViewer},
  data: () => ({
    docExists: false,
    lensSiteDocument: {},
    markdownContent: 'content missing',
    markdownHtml: 'content missing',
    history: [],
    versionHeaders: [
      {
        title: 'Version',
        key: 'version',
        value: 'version',
      },
      {
        title: 'Effective',
        key: 'effective',
        value: 'effective',
      },
      {
        title: 'Deprecated',
        key: 'deprecated',
        value: 'deprecated',
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
          this.docExists = true;
          this.lensSiteDocument = response.data[0];
          this.markdownContent = this.lensSiteDocument.current.markdownContent
          this.markdownHtml =  marked.parse(this.markdownContent);
          let newHistory = [];
          for (const h of this.lensSiteDocument.history) {
            newHistory.push({
              version: h.version,
              effective: this.dateFormat(h.effective),
              deprecated: h.deprecated ? this.dateFormat(h.deprecated) : '-',
            })
          }
          this.history = newHistory;
        }
      });
    },
    async saveKeyDocument(newDoc, version) {
      this.$refs.editKeyDocument.$data.isPatchPending = true;
      // interpret version text
      let effectiveDate;
      let deprecatedDate;
      try {
        let year  = parseInt(version.substring(0,4));
        let month = parseInt(version.substring(4,6));
        let day   = parseInt(version.substring(6,8));
        let keyDate = new Date(year, month-1, day);
        effectiveDate = keyDate.getTime();
        keyDate.setDate(keyDate.getDate() - 1);
        deprecatedDate = keyDate.getTime();
      } catch (e) {
        console.log(e.message);
      }
      if (!effectiveDate || !deprecatedDate) {
        this.$refs.editKeyDocument.$data.snackerMsg = "can't interpret version with date YYYYMMDD";
        this.$refs.editKeyDocument.$data.showSnacker = true;
        this.$refs.editKeyDocument.$data.isPatchPending = false;
        return;
      }
      let now = Date.now();
      if (this.docExists) {
        let newCurrent = {...this.lensSiteDocument.current};
        newCurrent.markdownContent = newDoc;
        let newHistory = [];
        newHistory.push(...this.lensSiteDocument.history);
        newCurrent.version = version;
        // deprecate the old
        const lastIndex = newHistory.length - 1;
        newHistory[lastIndex].deprecated = deprecatedDate;
        // add the new
        newCurrent.agreementDocId = this.newObjectId();
        newCurrent.effective = effectiveDate;
        newCurrent.docPostedAt = now;
        newHistory.push(newCurrent);
        // save it all and return
        await models.api.Agreements.patch(
          this.lensSiteDocument._id.toString(),
          {
            current: newCurrent,
            history: newHistory,
          }
        );
      } else { // else doc does not exist so create a new one
        let specificAgreement = {
          agreementDocId: this.newObjectId(),
          title: '', // todo: consider deprecating this field in later PR; field never used
          effective: effectiveDate,
          deprecated: null,
          version: version,
          markdownContent: newDoc,
          docPostedAt: now,
        }
        const agreement = {
          category: this.docName,
          current: specificAgreement,
          history: [specificAgreement],
        }
        await models.api.Agreements.create(agreement)
      }
      this.update();
      this.$refs.editKeyDocument.$data.isPatchPending = false;
      this.$refs.editKeyDocument.$data.dialog = false;
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
