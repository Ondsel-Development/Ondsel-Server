<template>
  <v-container>
    <v-card elevation="0">
      <v-card-title>My Notifications</v-card-title>
      <v-card-text>
        <v-table>
          <thead>
          <tr>
            <th class="text-left">
              Message
            </th>
            <th class="text-left">
              When
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="item in cleanNotifications"
            :key="item.when"
          >
            <td>
              <v-sheet :class="item.read ? `font-weight-normal` : `font-weight-bold`" @click="$router.push(item.route)">
                {{ item.message }}
              </v-sheet>
            </td>
            <td>
              <v-sheet :class="item.read ? `font-weight-normal` : `font-weight-bold`" @click="$router.push(item.route)">
                {{ item.when }}
              </v-sheet>
            </td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {mapState} from "vuex";
import {buildNavRoute} from "@/curationHelpers";

const { Notification } = models.api;

export default {
  name: "MyNotifications",
  data: () => ({
    notificationList: [],
    cleanNotifications: [],
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload', user: 'user' }),
  },
  async mounted() {
    const ntfDoc = await Notification.get(this.user.notificationsId);
    this.notificationList = ntfDoc.notificationsReceived || [];
    this.cleanNotifications = [];
    for (const ntf of this.notificationList) {
      const when = new Date(ntf.when);
      let rt = buildNavRoute(ntf.nav);
      this.cleanNotifications.unshift({
        message: ntf.bodySummaryTxt,
        when: when.toLocaleString(),
        route: rt,
      });
    }
  },
  methods: {
  },
}
</script>

<style scoped>

</style>
