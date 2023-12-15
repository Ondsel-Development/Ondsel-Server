<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">User {{ targetUser.name }}</div>
      <v-spacer />
    </v-row>
    <v-spacer />
    <p>Real name: {{ targetUser.name }}</p>
    <p>Username: {{ targetUsername }}</p>
    <div v-if="userIsMe">
      <v-list density="compact" nav>
        <v-list-item title="visit personal workspaces" :to="{ name: 'PersonalWorkspaces', params: {username: targetUsername} }"></v-list-item>
        <v-list-item title="visit personal model files" :to="{ name: 'Models', params: {username: targetUsername} }"></v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script>

import {mapActions, mapState} from "vuex";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'UserHomePage',
  components: { },
  data: () => ({
    targetUserdetail: {name: 'locating...'},
  }),
  async created() {
    this.targetUserdetail = await this.getUserByName(this.targetUsername);
  },
  async mounted() {
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    targetUsername: vm => vm.$route.params.username,
    targetUser: vm => vm.targetUserdetail,
    userIsMe: vm => (vm.user?._id === vm.targetUser?._id) && (vm.user?._id !== undefined)
  },
  methods: {
    ...mapActions('app', ['getUserByName'])
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'UserHomePage') {
        this.targetUserdetail = await this.getUserByName(this.targetUsername);
      }
    }
  }
}
</script>

<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
