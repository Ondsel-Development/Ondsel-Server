<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent style="background: #fafafa; border: none;">
    <select-organization :current-organization="currentOrganization"></select-organization>
    <v-text-field
      v-model="searchText"
      class="ma-4"
      append-inner-icon="mdi-magnify"
      density="compact"
      label="Search..."
      :variant="rail ? 'plain' : 'outlined'"
      hide-details
      single-line
      @click:append-inner="doSearch"
      @keyup.enter="doSearch"
    ></v-text-field>
    <v-list density="compact" nav>
      <template
        v-for="[icon, text, condition, path] in mainItems"
        :key="icon"
      >
        <v-list-item
          v-if="condition"
          :prepend-icon="icon"
          :to="path"
          link
        >
          <span class="text-body-2" style="color: black;">{{ text }}</span>
        </v-list-item>
      </template>
    </v-list>
    <template #append>
      <v-list density="compact" nav>
        <template
          v-for="[icon, text, condition, path] in secondaryItems"
          :key="icon"
        >
          <v-list-item
            v-if="condition"
            :prepend-icon="icon"
            :to="path"
            link
          >
            <span class="text-body-2" style="color: black;">{{ text }}</span>
          </v-list-item>
        </template>
      </v-list>
      <span v-if="!rail" class="d-flex justify-center text-caption mb-4">@ 2024 Ondsel, inc.</span>
      <v-divider />
      <v-list>
        <v-list-item
          v-if="loggedInUser"
          nav
        >
          <template #prepend>
            <v-sheet class="d-flex flex-column justify-center align-center text-uppercase ma-1" min-width="40" min-height="40" rounded="circle" color="grey" @click="rail = false">
              {{ getInitials(loggedInUser.user.name) }}
            </v-sheet>
          </template>
          <template #title>
            {{ loggedInUser.user.name }}
          </template>
          <template v-slot:append>
            <v-menu
              v-if="loggedInUser"
              v-model="menu"
              :close-on-content-click="false"
              transition="slide-y-transition"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
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
                    color="primary"
                    variant="text"
                    @click="logout"
                  >
                    Logout
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </template>
        </v-list-item>
        <v-list-item v-else>
          <span class="d-flex flex-row justify-center">
            <v-btn
              v-if="rail && currentRouteName !== 'Login' && currentRouteName !== 'SignUp'"
              variant="plain"
              icon="mdi-account"
              @click="rail = false;"
            />
            <template v-else>
              <template v-if="currentRouteName !== 'Login'">
                <v-btn
                  v-if="!rail"
                  variant="outlined"
                  class="ma-1"
                  :to="{ name: 'Login' }"
                >
                  Login
                </v-btn>
                <v-btn
                  v-else
                  variant="plain"
                  icon="mdi-login"
                  :to="{ name: 'Login' }"
                />
              </template>
              <template v-if="currentRouteName !== 'SignUp'">
                <v-btn
                  v-if="!rail"
                  variant="tonal"
                  color="primary"
                  class="ma-1"
                  :to="{ name: 'SignUp' }"
                >
                  SignUp
                </v-btn>
                <v-btn
                  v-else
                  variant="plain"
                  color="primary"
                  icon="mdi-account-plus-outline"
                  :to="{ name: 'SignUp' }"
                />
              </template>
            </template>
          </span>
        </v-list-item>
      </v-list>
    </template>
    <v-btn :icon="rail ? 'mdi-menu-right' : 'mdi-menu-left'" variant="plain" class="railButton" @click.stop="rail = !rail"></v-btn>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import SelectOrganization from '@/components/SelectOrganization.vue';
import {getInitials} from "../../genericHelpers";

export default {
  name: "MainNavigationBar",
  components: { SelectOrganization },
  data: () => ({
    menu: false,
    searchText: '',
    drawer: null,
    rail: false,
  }),
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    currentRouteName: (vm) => vm.$route.name,
    currentOrganization() {
      return this.userCurrentOrganization;
    },
    mainItems() {
      return [
        [
          'mdi-cube-outline',
          'Models',
          this.user,
          { name: 'Models', params: { slug: this.user?.username }}
        ],
        [
          'mdi-view-dashboard-outline',  // icon
          `Public view of ${this.currentOrganization?.name}`,  // label
          this.user && this.currentOrganization && this.currentOrganization?.type !== 'Personal',  // condition
          { name: 'OrganizationHome', params: { slug: this.currentOrganization?.refName }}  // route
        ],
        [
          'mdi-earth',
          'Public View of Me',
          this.user && this.currentOrganization && this.currentOrganization?.type !== 'Personal',
          { name: 'UserHome', params: { slug: this.user?.username }}
        ],
        [
          'mdi-dots-square',
          'Public Models',
          true,
          { name: 'PublicModels' }
        ],
      ]
    },
    secondaryItems() {
      return [
        [
          'mdi-bell-outline',
          'Notifications',
          this.user,
          { name: 'MyNotifications' }
        ],
        [
          'mdi-inbox',
          'Shared With Me',
          this.user,
          { name: 'SharedWithMe' }
        ],
        [
          'mdi-bookmark-outline',
          'Bookmarks',
          this.user,
          { name: 'Bookmarks' }
        ],
        [
          'mdi-download-outline',
          'Download Ondsel ES',
          true,
          { name: 'DownloadAndExplore' }
        ],
        // ['mdi-emoticon-happy-outline', 'Community'],
        // ['mdi-help-circle-outline', 'Help'],
      ]
    }
  },
  methods: {
    getInitials,
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
    },
    doSearch() {
      this.rail = false;
      if (this.searchText) {
        this.$router.push({ name: 'SearchResults', params: { text: this.searchText } });
      }
    },
  },
}
</script>


<style scoped>
.railButton {
  position: absolute;
  top: 49%;
  right: -17px;
}
</style>
