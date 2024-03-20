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
                      @click.stop="openEditPromotionDialog(item)"
                    >
                      mdi-pencil
                    </v-icon>
                  </template>
                </v-data-table>
                <edit-promotion-dialog ref="editPromotionDialog" :collection="rowCollection" :item-id="rowItemId" :item-name="rowItemName"></edit-promotion-dialog>
              </v-card-text>
            </v-card>
          </v-list-item-media>
          <v-list-item-action class="justify-end">
          </v-list-item-action>
        </v-list-item>
      </v-list>

    </v-card-text>
  </v-card>

</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {marked} from "marked";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import {translateCollection} from "@/curationHelpers";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierModifyLensHomePageCuration',
  components: {EditPromotionDialog, MarkdownViewer},
  data: () => ({
    lensSiteCuration: {},
    markdownHtml: 'missing data',
    title: 'missing title',
    promoted: [],
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
    rowCollection: "tbd",
    rowItemId: "tbd",
    rowItemName: "tbd",
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
          this.lensSiteCuration = response.data[0];
          this.markdownHtml =  marked.parse(this.lensSiteCuration.current.markdownContent);
          this.title = this.lensSiteCuration.current.curation.description || '';
          let newProm = [];
          const currentProm = this.lensSiteCuration.current.curation.promoted || [];
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
    async openEditPromotionDialog(item) {
      this.rowCollection = item.columns.collection;
      this.rowItemId = item.columns.id;
      this.rowItemName = item.columns.name;
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
  },
  watch: {
  }
}
</script>
<style scoped>
</style>
