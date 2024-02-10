<template>
  <v-data-table
    v-if="organization"
    :headers="headers"
    :items="organization.curation?.promoted"
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

export default {
  name: "OrganizationPromotionsTable",
  props: {
    organization: Object,
  },
  components: {EditPromotionDialog},
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
  },
  data: () => ({
    headers: [
      {
        title: 'Public Comment',
        align: 'start',
        sortable: true,
        key: 'message',
        value: 'notation.message',
      },
      {
        title: 'Type',
        sortable: true,
        key: 'collection',
        value: 'curation.collection',
      },
      {
        title: 'Name',
        sortable: true,
        key: 'name',
        value: 'curation.name',
      },
      {
        title: 'Id',
        sortable: true,
        key: 'id',
        value: 'curation._id',
      },
      {
        title: 'Actions',
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
    async openEditPromotionDialog(item) {
      this.rowCollection = item.columns.collection;
      this.rowItemId = item.columns.id.toString();
      this.rowItemName = item.columns.name;
      this.$refs.editPromotionDialog.$data.dialog = true;
    },
  },
}
</script>

<style scoped>

</style>
