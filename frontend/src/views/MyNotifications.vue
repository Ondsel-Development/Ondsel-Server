<template>
  <Main>
    <template #title>
      <v-icon icon="mdi-bell-outline" />
      My Notifications
    </template>
    <template #content>
      <v-card elevation="0">
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
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="item in cleanNotifications"
              :key="item.when"
            >
              <td>
                <v-sheet :class="item.read ? `font-weight-normal` : `font-weight-bold`" @click="gotoRoute(item)">
                  {{ item.message }}
                </v-sheet>
              </td>
              <td>
                <v-sheet :class="item.read ? `font-weight-normal` : `font-weight-bold`" @click="gotoRoute(item)">
                  {{ item.when }}
                </v-sheet>
              </td>
              <td>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn color="decoration" flat icon="mdi-dots-vertical" v-bind="props"></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="markAndRefresh(item, false)" v-if="item.read">
                      <v-list-item-title><v-icon icon="mdi-email" class="mx-2"></v-icon> Mark As Unread</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="markAndRefresh(item, true)" v-if="!item.read">
                      <v-list-item-title><v-icon icon="mdi-email-open" class="mx-2"></v-icon> Mark As Read</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeAndRefresh(item)">
                      <v-list-item-title><v-icon icon="mdi-delete" class="mx-2"></v-icon> Remove</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
            </tbody>
          </v-table>
          <v-sheet v-if="cleanNotifications.length === 0">
            <v-card class="ma8"><v-card-text><em>No Notifications</em></v-card-text></v-card>
          </v-sheet>
        </v-card-text>
      </v-card>
    </template>
  </Main>
</template>

<script>
import { models } from '@feathersjs/vuex';
import {mapState} from "vuex";
import {buildNavRoute} from "@/curationHelpers";
import Main from '@/layouts/default/Main.vue';

const { Notification } = models.api;

export default {
  name: "MyNotifications",
  components: { Main },
  data: () => ({
    notificationList: [],
    cleanNotifications: [],
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload', user: 'user' }),
  },
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh() {
      const ntfDoc = await Notification.get(this.user.notificationsId);
      this.notificationList = ntfDoc.notificationsReceived || [];
      this.cleanNotifications = [];
      for (const ntf of this.notificationList) {
        const when = new Date(ntf.when);
        let rt = buildNavRoute(ntf.nav);
        this.cleanNotifications.unshift({
          _id: ntf._id,
          read: ntf.read,
          message: ntf.bodySummaryTxt,
          when: when.toLocaleString(),
          route: rt,
        });
      }
    },
    async gotoRoute(item) {
      await this.markReadOrUnread(item, true);
      this.$router.push(item.route);
    },
    async markAndRefresh(item, desiredState) {
      await this.markReadOrUnread(item, desiredState);
      await this.refresh();
    },
    async markReadOrUnread(item, desiredState) {
      if (item.read !== desiredState) {
        await Notification.patch(this.user.notificationsId, {
          shouldMarkReadOrUnread: true,
          markRead: desiredState,
          notificationIds: [item._id]
        })
      }
    },
    async removeAndRefresh(item) {
      await Notification.patch(this.user.notificationsId, {
        shouldDelete: true,
        notificationIds: [item._id]
      })
      await this.refresh();
    },
  },
}
</script>

<style scoped>

</style>
