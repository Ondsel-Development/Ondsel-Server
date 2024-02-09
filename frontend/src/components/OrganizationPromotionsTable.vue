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
        @click="deletePromotion(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
  <div v-if="isLoggedInUserAdmin"><i>To add a promotion, visit the public web page of the workspace/person/org/etc and click on the bullhorn <v-icon size="small">mdi-bullhorn</v-icon> icon.</i></div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: "OrganizationPromotionsTable",
  props: {
    organization: Object,
  },
  components: {},
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
  },
  data: () => ({
    headers: [
      {
        title: 'Public Comment',
        align: 'start',
        sortable: true,
        key: 'notation.message',
      },
      {
        title: 'Type',
        sortable: true,
        key: 'curation.collection',
      },
      {
        title: 'Name',
        sortable: true,
        key: 'curation.name',
      },
      {
        title: 'Actions',
        align: 'end',
        key: 'actions',
        sortable: false
      },
    ],
  }),
  methods: {
    async deletePromotion(item) {
      console.log(item);
      // TBD
    },
  },
}
</script>

<style scoped>

</style>
