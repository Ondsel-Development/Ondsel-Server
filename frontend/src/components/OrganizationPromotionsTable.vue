<template>
  <v-data-table
    v-if="organization"
    :headers="headers"
    :items="cleanPromotions"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Publicly Promoted Items</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        @click.stop="openEditPromotionDialog(item)"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
  <div v-if="isLoggedInUserAdmin"><i>To add a promotion, visit the public web page of the workspace/person/org/etc and click on the bullhorn <v-icon size="small">mdi-bullhorn</v-icon> icon.</i></div>
  <edit-promotion-dialog ref="editPromotionDialog" :collection="rowCollection" :item-id="rowItemId" :item-name="rowItemName"></edit-promotion-dialog>
</template>

<script>
import {mapGetters} from 'vuex';
import EditPromotionDialog from "@/components/EditPromotionDialog.vue";
import {translateCollection} from "@/curationHelpers";

export default {
  name: "OrganizationPromotionsTable",
  props: {
    organization: Object,
  },
  components: {EditPromotionDialog},
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
    cleanPromotions: vm => vm.cleanupPromotions(vm.organization?.curation?.promoted),
  },
  data: () => ({
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
  methods: {
    cleanupPromotions(promotions) {
      let result = [];
      if (promotions) {
        for (const promotion of promotions) {
          result.push({
            id: promotion.curation._id.toString(),
            message: promotion.notation.message,
            collection: promotion.curation.collection,
            collectionName: translateCollection(promotion.curation.collection),
            name: promotion.curation.name,
          })
        }
      }
      return result;
    },
    async openEditPromotionDialog(item) {
      this.rowCollection = item.collection;
      this.rowItemId = item.id;
      this.rowItemName = item.name;
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
  },
}
</script>

<style scoped>

</style>
