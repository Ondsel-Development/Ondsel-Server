<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-data-table
    :headers="headers"
    :items="promotedUsers"
    density="compact"
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
        <td>
          {{ item.curation.description }}<br>
          <span style="color: blue">{{ item.notation.message }}</span>
        </td>
      </tr>
    </template>
    <template #bottom></template>
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
        title: 'Detail',
        align: 'start',
        sortable: false,
      },
    ]
  }),
  methods: {
    getInitials,
  }
}
</script>

<style scoped>

</style>
