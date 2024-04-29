<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-img
      src="https://ondsel.com/img/Logo_LightBG.svg"
      max-width="12em"
      @click="gotoHome()"
    ></v-img>

    <v-spacer></v-spacer>

    <v-btn
      v-if="loggedInUser"
      variant="plain"
      class="text-h6 text-decoration-underline align-self-center"
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

    <v-btn
      icon
      @click="$refs.searchPopupDialog.$data.dialog = true;"
    >
      <v-icon>mdi-magnify</v-icon>
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
          <v-list-item>
            <v-btn
              variant="text"
              @click="gotoDownloadAndExplore()"
            >
              download & explore
            </v-btn>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
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
    <v-list density="compact" nav v-if="user && currentOrganization && currentOrganization.type !== 'Personal'">
      <v-list-item prepend-icon="mdi-view-dashboard" :to="{ name: 'OrganizationHome', params: {slug: currentOrganization.refName}}">Public view of {{ currentOrganization.name }}</v-list-item>
    </v-list>
    <v-list density="compact" nav v-if="user && currentOrganization && currentOrganization.type === 'Personal'">
      <v-list-item prepend-icon="mdi-view-dashboard" :to="{ name: 'UserHome', params: {slug: user.username}}">Public View of Me</v-list-item>
    </v-list>
    <v-list density="compact" nav v-if="user">
      <v-list-item prepend-icon="mdi-view-dashboard" title="My Models" :to="{ name: 'Models', params: {slug: user?.username}}"></v-list-item>
    </v-list>
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" title="Public Models" :to="{ name: 'PublicModels'}"></v-list-item>
    </v-list>
    <v-list density="compact" nav v-if="user">
      <v-list-item prepend-icon="mdi-inbox" title="SharedWithMe" :to="{ name: 'SharedWithMe'}"></v-list-item>
    </v-list>
    <v-list density="compact" nav v-if="user">
      <v-list-item prepend-icon="mdi-bookmark" title="Bookmarks" :to="{ name: 'Bookmarks'}"></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <SelectOrganization ref="selectedOrganization" :current-organization="currentOrganization" />
  <search-popup-dialog ref="searchPopupDialog"></search-popup-dialog>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import SelectOrganization from '@/components/SelectOrganization';
import SearchPopupDialog from "@/components/SearchPopupDialog.vue";

export default {
  name: 'AppBar',

  components: {SearchPopupDialog, SelectOrganization },
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
      return this.userCurrentOrganization;
    },
  },
  methods: {
    ...mapActions('auth', {authLogout: 'logout'}),
    logout() {
      this.authLogout().then(() => this.$router.push({ name: 'Logout' }));
      this.menu = false;
    },
    gotoAccountSettings() {
      this.$router.push({name: 'AccountSettings', params: {slug: this.user.username}});
      this.menu = false;
    },
    gotoDownloadAndExplore() {
      this.$router.push({name: 'DownloadAndExplore'});
      this.menu = false;
    },
    gotoHome() {
      this.$router.push({name: 'LensHome'});
    }
  },
}
</script>
