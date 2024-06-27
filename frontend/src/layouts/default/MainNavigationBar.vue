<template>
  <v-navigation-drawer
    :rail="rail"
    permanent
  >
    <v-list-item
      :title = "currentOrganization?.name || ''"
      @click = "$refs.selectOrgDialog.$data.dialog = true"
    >
      <template v-slot:prepend>
        <v-sheet
          class="d-flex flex-column justify-center align-center text-uppercase mr-8"
          width="24"
          height="24"
          rounded="circle"
          color="grey-darken-2"
        >
          {{ getInitials(currentOrganization?.name || '') }}
        </v-sheet>
      </template>
    </v-list-item>
    <v-list-item
      :prepend-icon="railIcon"
      title = " <<<<< "
      @click="rail = !rail"
    ></v-list-item>
    <v-list-item
      prepend-icon="mdi-magnify"
    >
      <v-text-field
        v-model="searchText"
        density="compact"
        label="Search..."
        :variant="rail ? 'plain' : 'outlined'"
        hide-details
        single-line
        @click:append-inner="doSearch"
        @keyup.enter="doSearch"
      ></v-text-field>
    </v-list-item>
    <v-list-item
      v-for="item in mainItems"
      :key="item.icon"
      :prepend-icon="item.icon"
      :to="item.route"
      :title="item.title"
      link
    ></v-list-item>
    <template #append>
      <v-list-item
        v-for="item in secondaryItems"
        :key="item.icon"
        :prepend-icon="item.icon"
        :to="item.route"
        :title="item.title"
        link
      ></v-list-item>
      <v-divider></v-divider>
      <v-list-item
        prepend-icon="mdi-copyright"
        title="2024 Ondsel Inc."
      ></v-list-item>
      <v-list-item
        :prepend-icon="railIcon"
        title = " <<<<< "
        @click="rail = !rail"
      ></v-list-item>
    </template>
  </v-navigation-drawer>
  <select-organization-dialog ref="selectOrgDialog"></select-organization-dialog>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { getInitials } from '@/genericHelpers';
import OrganizationMixin from '@/mixins/organizationMixin';
import SelectOrganizationDialog from "@/layouts/default/SelectOrganizationDialog.vue";

export default {
  name: "MainNavigationBar",
  components: {SelectOrganizationDialog},
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
    railIcon () {
      return this.rail ? 'mdi-menu-right' : 'mdi-menu-left'
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
      ].filter(item => item.condition);
    },
    // orgItems() {
    //   const orgs = this.user?.organizations || [];
    //   return orgs.map((org) => {
    //     return {
    //       value: org._id.toString(),
    //       title: org.name,
    //       props: { subtitle: org.type},
    //     }
    //   });
    // }
  },
  methods: {
    getInitials,
    ...mapActions('auth', {authLogout: 'logout'}),
    // reassignSelect() {
    //   const orgId = this.userCurrentOrganization?._id || '';
    //   this.currentOrganizationId = orgId.toString();
    //   console.log(`set to ${this.currentOrganizationId}`);
    // },
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
  // watch: {
  //   async 'userCurrentOrganization'(to, from) {
  //     this.reassignSelect();
  //   }
  // },
}
</script>


<style scoped>
.railButton {
  position: absolute;
  top: 49%;
  right: -17px;
}
</style>
