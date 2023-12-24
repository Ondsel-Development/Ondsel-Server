<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    <v-img src="/ondsel_logo.svg" max-width="40" max-height="40" class="ml-2 mr-n3"></v-img>
    <v-app-bar-title>
      <router-link to="/" style="text-decoration: none; color: inherit;">
        ONDSEL
      </router-link>
    </v-app-bar-title>

    <v-btn
      v-if="loggedInUser"
      variant="plain"
      class="text-h6 text-decoration-underline"
      flat
      @click="$refs.selectedOrganization.$data.dialog = true;"
    >
      {{ (currentOrganization && currentOrganization.name) || 'Select Organization' }}
    </v-btn>
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
            :title="`${loggedInUser.user.name}`"
          >
          </v-list-item>
          <v-list-item>
            <v-btn
              variant="text"
              @click="gotoAccountSettings()"
            >
              account settings
            </v-btn>
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

    <v-navigation-drawer
      v-model="drawer"
      location="left"
      temporary
    >
      <v-list density="compact" nav v-if="user">
        <v-list-item prepend-icon="mdi-view-dashboard" title="My Models" :to="{ name: 'Models', params: {slug: user?.username}}"></v-list-item>
      </v-list>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Public Models" :to="{ name: 'PublicModels'}"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <SelectOrganization ref="selectedOrganization" :current-organization="currentOrganization" />
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import SelectOrganization from '@/components/SelectOrganization';

export default {
  name: 'AppBar',

  components: { SelectOrganization },
  data: () => ({
    menu: false,
    drawer: false,
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    currentRouteName: (vm) => vm.$route.name,
    currentOrganization() {
      // const currentOrganizationId = this.extractOrganizationId(this.$route.fullPath);
      // if (currentOrganizationId) {
      //   const [organization] = this.user.organizations.filter(org => org._id === this.$route.params.id);
      //   return organization;
      // }
      return this.userCurrentOrganization;
    },
  },
  methods: {
    ...mapActions('auth', {authLogout: 'logout'}),
    // ...mapActions('app', ['setCurrentOrganization']),
    logout() {
      this.authLogout().then(() => this.$router.push({ name: 'Login' }));
    },
    gotoAccountSettings() {
      this.$router.push({name: 'AccountSettings', params: {slug: this.user.username}});
    },
    // extractOrganizationId(path) {
    //   const regex = /\/org\/([^\/]+)/;
    //   const match = path.match(regex);
    //   if (match && match[1]) {
    //     return match[1];
    //   } else {
    //     return null;
    //   }
    // }
  },
}
</script>
