<template>
  <v-navigation-drawer
    :rail="rail"
    permanent
    @click="rail = !rail"
  >
    <v-list-item
      v-for="item in mainItems"
      :key="item.icon"
      :prepend-icon="item.icon"
      :to="item.route"
      :title="item.title"
      link
    ></v-list-item>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { getInitials } from '@/genericHelpers';
import OrganizationMixin from '@/mixins/organizationMixin';

export default {
  name: "MainNavigationBar",
  mixins: [ OrganizationMixin ],
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
      const items = [
        {
          icon: 'mdi-folder-multiple-outline',
          title: 'Workspaces',
          condition: this.user && this.currentOrganization && this.currentOrganization?.type === 'Personal',
          route: {name: 'UserWorkspaces', params: {id: this.user?.username}}
        },
        {
          icon: 'mdi-folder-multiple-outline',
          title: 'Workspaces',
          condition: this.user && this.currentOrganization && this.currentOrganization?.type !== 'Personal',
          route: { name: 'OrganizationWorkspaces', params: { id: this.currentOrganization?.refName }}
        },
        {
          icon: 'mdi-cube-outline',
          title: 'Models',
          condition: this.user,
          route: {name: 'Models', params: {slug: this.user?.username}}
        },
        {
          icon: 'mdi-view-dashboard-outline',  // icon
          title:   `Public view of ${this.currentOrganization?.name}`,  // label
          condition: this.user && this.currentOrganization && this.currentOrganization?.type !== 'Personal',  // condition
          route: {name: 'OrganizationHome', params: {slug: this.currentOrganization?.refName}}  // route
        },
        {
          icon: 'mdi-earth',
          title:    'Public View of Me',
          condition: this.user && this.currentOrganization && this.currentOrganization?.type === 'Personal',
          route: {name: 'UserHome', params: {slug: this.user?.username}}
        },
        {
          icon: 'mdi-dots-square',
          title: 'Public Models',
          condition: true,
          route: {name: 'PublicModels'}
        },
      ];
      return items.filter(item => item.condition);
    },
    secondaryItems() {
      return [
        {
          icon: 'mdi-bell-outline',
          title: 'Notifications',
          condition: this.user,
          route: {name: 'MyNotifications'}
        },
        {
          icon: 'mdi-inbox',
          title: 'Shared With Me',
          condition: this.user,
          route: {name: 'SharedWithMe'}
        },
        {
          icon: 'mdi-bookmark-outline',
          title: 'Bookmarks',
          condition: this.user,
          route: {name: 'Bookmarks'}
        },
        {
          icon: 'mdi-download-outline',
          title: 'Download Ondsel ES',
          condition: true,
          route: {name: 'DownloadAndExplore'}
        },
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
