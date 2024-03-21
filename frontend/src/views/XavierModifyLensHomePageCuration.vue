<template>
  <v-card class="ma-4">
    <v-card-title>Modify Lens Home Page Curation</v-card-title>
    <v-card-subtitle>Professor Xavier's School For The Hidden</v-card-subtitle>
    <v-card-text>
      <v-list lines="three">
        <v-list-subheader><i>All Changes Are Public</i></v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Title (Description)</v-list-item-title>
          <v-list-item-subtitle>
            {{ title }}
          </v-list-item-subtitle>
          <v-list-item-action class="justify-end">
            <v-btn
              class="ma-2"
              @click.stop="$refs.editDescription.$data.dialog=true"
            >
              Edit
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Text Body (markdown)</v-list-item-title>
          <v-list-item-media>
            <v-card>
              <v-card-text>
                <markdown-viewer :markdown-html="markdownHtml"></markdown-viewer>
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
          <v-list-item-title>Promotions</v-list-item-title>
          <v-list-item-media>
            <v-card>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="promoted"
                >
                  <template v-slot:item.actions="{ item }">
                    <v-icon
                      size="small"
                      @click.stop="deletePromotion(item)"
                    >
                      mdi-cancel
                    </v-icon>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-list-item-media>
          <v-list-item-action class="justify-end">
            <v-btn
              class="ma-2"
              @click.stop="$refs.createPromotion.$data.dialog=true"
            >
              <v-icon
                size="small"
              >
                mdi-plus
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Curation Versioning</v-list-item-title>
          <v-list-item-subtitle>last: {{ lensSiteDocument?.current?.version }} effective {{ dateFormat(lensSiteDocument?.current?.effective) }}</v-list-item-subtitle>
          <v-list-item-media>
            <v-card>
              <v-card-text>
                <v-data-table :headers="versionHeaders" :items="history"></v-data-table>
              </v-card-text>
            </v-card>
          </v-list-item-media>
          <v-list-item-action class="justify-end">
            <v-btn
              class="ma-2"
              @click.stop="$refs.takeSnapshotDialog.$data.dialog=true"
            >
              Take Snapshot Of Curation
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

    </v-card-text>
  </v-card>

  <edit-description-dialog ref="editDescription" :description="title" @save-description="saveDescription"></edit-description-dialog>
  <edit-long-description-md-dialog ref="editLongDescriptionMd" :long-description-md="lensSiteDocument?.current?.markdownContent" @save-long-description-md="saveLongDescriptionMd"></edit-long-description-md-dialog>
  <create-xavier-promotion-from-url ref="createPromotion" @create-promotion="createPromotion"></create-xavier-promotion-from-url>
  <edit-description-dialog ref="takeSnapshotDialog" description="" label="Give Snapshot A Version Name" @save-description="takeSnapshot"></edit-description-dialog>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {marked} from "marked";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import {translateCollection} from "@/curationHelpers";
import CreateXavierPromotionFromUrl from "@/components/CreateXavierPromotionFromURL.vue";
import EditDescriptionDialog from "@/components/EditDescriptionDialog.vue";
import EditLongDescriptionMdDialog from "@/components/EditLongDescriptionMdDialog.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierModifyLensHomePageCuration',
  components: {EditLongDescriptionMdDialog, EditDescriptionDialog, CreateXavierPromotionFromUrl, MarkdownViewer},
  data: () => ({
    lensSiteDocument: {},
    markdownHtml: 'missing data',
    title: 'missing title',
    promoted: [],
    history: [],
    headers: [
      {
        title: 'Public Comment',
        align: 'start',
        sortable: true,
        key: 'message',
        value: 'message',
      },
      {
        title: 'Type',
        sortable: true,
        key: 'collection',
        value: 'collectionName',
      },
      {
        title: 'Name',
        sortable: true,
        key: 'name',
        value: 'name',
      },
      {
        title: '',
        align: 'end',
        key: 'actions',
        sortable: false
      },
    ],
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
      console.log("alert-33234-mlhpc");
      this.$router.push({name: 'LensHome', params: {}});
    }
    await this.update();
  },
  computed: {
    ...mapState('auth', ['user']),
  },
  methods: {
    update() {
      models.api.Agreements.find({
        query: {category: 'lens-site-curation'}
      }).then(response => {
        if (response.data.length > 0) {
          this.lensSiteDocument = response.data[0];
          this.markdownHtml =  marked.parse(this.lensSiteDocument.current.markdownContent);
          this.title = this.lensSiteDocument.current.curation.description || '';
          let newHistory = [];
          for (const h of this.lensSiteDocument.history) {
            newHistory.push({
              version: h.version,
              date: this.dateFormat(h.effective),
            })
          }
          this.history = newHistory;
          let newProm = [];
          const currentProm = this.lensSiteDocument.current.curation.promoted || [];
          for (const promotion of currentProm) {
            newProm.push({
              id: promotion.curation._id.toString(),
              message: promotion.notation.message,
              collection: promotion.curation.collection,
              collectionName: translateCollection(promotion.curation.collection),
              name: promotion.curation.name,
            })
          }
          this.promoted = newProm;
        }
      });
    },
    async createPromotion(curation, comment) {
      let newCurrent = this.lensSiteDocument.current;
      newCurrent.curation.promoted.push({
        notation: {
          updatedAt: Date.now(),
          historicUser: {
            _id: this.user._id,
            username: this.user.username,
            name: this.user.name,
            tier: this.user.tier,
          },
          message: comment,
        },
        curation: curation,
      })
      await this.lensSiteDocument.patch({
        current: newCurrent,
      })
      this.update();
    },
    async deletePromotion(item) {
      let newCurrent = this.lensSiteDocument.current;
      newCurrent.curation.promoted = newCurrent.curation.promoted.filter(promo => promo.curation._id.toString() !== item.value);
      await this.lensSiteDocument.patch({
        current: newCurrent,
      })
      this.update();
    },
    async saveDescription() {
      let newCurrent = this.lensSiteDocument.current;
      newCurrent.curation.description = this.$refs.editDescription.$data.newDescription;
      await this.lensSiteDocument.patch({
        current: newCurrent,
      })
      this.update();
      this.$refs.editDescription.$data.dialog = false;
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
