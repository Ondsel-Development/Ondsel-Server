<template>
  <v-container>
    <v-card
      class="mx-auto"
    >
      <v-list>
        <v-list-subheader>Messages</v-list-subheader>
        <template v-for="message of sharedModel.messages" :key="message._id">
          <v-list-item>
            <template v-slot:title>
              <span class="text-body-2" v-html="getMessageTitle(message)" />
            </template>
            <template v-slot:subtitle>
              <v-card>
                <v-card-text class="pa-0">
                  <span class="text-body-1">
                    {{ message.text }}
                  </span>
                </v-card-text>
              </v-card>
            </template>
          </v-list-item>
          <v-divider></v-divider>
        </template>
        <span v-if="!sharedModel.messages.length" class="ma-2 pa-2 text-body-2">No message exist!</span>
      </v-list>
      <v-card-actions>
        <v-text-field
          v-if="isAuthenticated"
          v-model="text"
          label="Type your message..."
          @keyup.enter="postMessage"
          append-icon="mdi-send"
          @click:append="postMessage"
          :loading="isPatchPending"
          :disabled="isPatchPending"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: "Messages",
  props: {
    sharedModel: {
      type: Object,
      required: true,
    }
  },
  data: () => ({
    text: '',
  }),
  computed: {
    ...mapState('shared-models', ['isPatchPending']),
    ...mapGetters('auth', ['isAuthenticated']),
  },
  methods: {
    dateFormat(number) {
      const date = new Date(number);
      return date.toLocaleString();
    },
    getUserDetails(userId) {
      return this.sharedModel.messagesParticipants.find(item => item._id === userId) || {};
    },
    getMessageTitle(message) {
      const userDetail = this.getUserDetails(message.createdBy);
      return `${userDetail.name} (<span class="font-italic">${userDetail.username}</span>) - ${this.dateFormat(message.createdAt)}`;
    },
    async postMessage() {
      if (!this.text.replaceAll(' ', '')) {
        return;
      }
      await this.sharedModel.patch({ data: { message: { text: this.text } } });
      this.text = '';
    }
  }
}
</script>

<style scoped>

</style>
