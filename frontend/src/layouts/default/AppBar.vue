<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon></v-app-bar-nav-icon>

    <v-app-bar-title>
      ONDSEL
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn flat v-if="!loggedInUser && currentRouteName !== 'SignUp'" :to="{ name: 'SignUp' }">
      SignUp
    </v-btn>

    <v-btn flat v-if="!loggedInUser && currentRouteName !== 'Login'" :to="{ name: 'Login' }">
      Login
    </v-btn>

    <v-menu
      v-if="loggedInUser"
      v-model="menu"
      :close-on-content-click="false"
      transition="slide-y-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-card min-width="200">
        <v-list v-if="loggedInUser">
          <v-list-item
            :title="`${loggedInUser.user.firstName} ${loggedInUser.user.lastName}`"
          >
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="menu = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="logout"
          >
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    </v-app-bar>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'AppBar',

  data: () => ({
    menu: false,
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    currentRouteName: (vm) => vm.$route.name
  },
  methods: {
    ...mapActions('auth', {authLogout: 'logout'}),
    logout() {
      this.authLogout().then(() => this.$router.push({ name: 'Login' }));
    },
  },
}
</script>
