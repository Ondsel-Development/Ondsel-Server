<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">Organization {{ targetOrg.name }}</div>
      <v-spacer />
    </v-row>
    <v-spacer />
    <p>Full Name: {{ targetOrg.name }}</p>
    <p>Slug: {{ targetOrgName }}</p>
    <div v-if="iAmThisOrg">
      <v-list density="compact" nav>
        <v-list-item title="visit org workspaces" :to="{ name: 'OrganizationWorkspaces', params: {orgName: targetOrgName} }"></v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script>

import {mapActions, mapGetters, mapState} from "vuex";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'OrganizationHomePage',
  components: { },
  data: () => ({
    targetOrgDetail: {name: 'locating...'},
  }),
  async created() {
    this.targetOrgDetail = await this.getOrganizationByNamePublic(this.targetOrgName);
  },
  async mounted() {
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    targetOrgName: vm => vm.$route.params.orgName,
    targetOrg: vm => vm.targetOrgDetail,
    iAmThisOrg: vm => (vm.userCurrentOrganization !== undefined) && (vm.userCurrentOrganization?.refName === vm.targetOrgName)
  },
  methods: {
    ...mapActions('app', ['getOrganizationByNamePublic'])
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationHomePage') {
        this.targetOrgDetail = await this.getOrganizationByNamePublic(this.targetOrgName);
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
