<template>
  <v-data-table
    :headers="headers"
    :items="promotedUsers"
    hover
    item-selectable
  >
    <template v-slot:item="{ item }">
      <tr @click="$router.push({ name: 'UserHome', params: { slug: item.curation.nav.username } })">
        <td>
          <div class="d-flex flex-row align-center">
            <v-sheet class="d-flex flex-column justify-center align-center text-uppercase ma-1" width="25" height="25" rounded="circle" color="grey">
              {{ getInitials(item.curation.name) }}
            </v-sheet>
            {{ item.curation.name }}
          </div>
        </td>
        <td>{{ item.curation.description }}</td>
        <td>{{ item.notation.message }}</td>
        <td><v-btn icon="mdi-arrow-right" flat @click.stop="goToUserProfile(item)"></v-btn></td>
      </tr>
    </template>

  </v-data-table>
</template>

<script>
import { getInitials } from '@/genericHelpers';

export default {
  name: "PromotedUsersTable",
  props: {
    promotedUsers: Array,
  },
  data: () => ({
    headers: [
      {
        title: 'Name',
        align: 'start',
        sortable: true,
      },
      {
        title: 'Description',
        align: 'start',
        sortable: false,
      },
      {
        title: 'Message',
        align: 'start',
        sortable: false,
      },
      {
        title: 'Action',
        align: 'start',
        sortable: false,
      },
    ]
  }),
  methods: {
    getInitials,
    goToUserProfile(item) {
      this.$router.push({ name: 'UserHome', params: { slug: item.curation.nav.username } });
    }
  }
}
</script>

<style scoped>

</style>
