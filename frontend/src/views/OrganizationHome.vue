<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">Organization {{ organization.name }}</div>
      <v-spacer />
    </v-row>
    <v-spacer />
  </v-container>
  <v-container>
    <p>Full Name: <b>{{ organization.name }}</b></p>
    <p>Slug: <code>{{ targetOrgName }}</code></p>
    <p>Nature: <code>{{organization.type}}</code></p>
    <div v-if="iAmThisOrg">
      <v-list>
        <v-list-item title="visit org workspaces" :to="{ name: 'OrganizationWorkspaces', params: {id: targetOrgName} }"></v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'OrganizationHome',
  components: { },
  data: () => ({
    targetOrgDetail: {name: 'locating...'},
  }),
  async mounted() {
    this.targetOrgDetail = await this.getOrgByIdOrNamePublic(this.targetOrgName);
    if (!this.targetOrgDetail) {
      this.$router.push({ name: 'PageNotFound' });
    }
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    targetOrgName: vm => vm.$route.params.slug,
    organization: vm => vm.targetOrgDetail,
    iAmThisOrg: vm => (vm.userCurrentOrganization !== undefined) && (vm.userCurrentOrganization?.refName === vm.targetOrgName)
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic'])
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'OrganizationHome') {
        this.targetOrgDetail = await this.getOrgByIdOrNamePublic(this.targetOrgName);
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
