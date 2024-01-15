<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">User {{ userSum.name }}</div>
      <v-spacer />
    </v-row>
    <v-spacer />
  </v-container>
  <v-container>
    <p>Full Name: <b>{{ userSum.name }}</b></p>
    <p>Slug: <code>{{ userSum.username }}</code></p>
    <div v-if="iAmThisUser">
      <v-list>
        <v-list-item title="visit your workspaces" :to="{ name: 'UserWorkspaces', params: {id: targetUsername} }"></v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script>
import {mapActions, mapState} from "vuex";
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'UserHome',
  components: { },
  data: () => ({
    userSumDetail: {name: 'locating...', username: ''},
  }),
  async mounted() {
    this.userSumDetail = await this.getUserByIdOrNamePublic(this.targetUsername);
    if (!this.userSumDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    targetUsername: vm => vm.$route.params.slug,
    userSum: vm => vm.userSumDetail,
    iAmThisUser: vm => vm.loggedInUser?.user?.username === vm.$route.params.slug,
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic'])
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'UserHome') {
        this.userSumDetail = await this.getUserByIdOrNamePublic(this.targetUsername);
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
