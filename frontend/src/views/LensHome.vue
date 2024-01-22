<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">LENS</div>
      <v-spacer />
    </v-row>
    <br>
    <v-row class="pl-4 pr-4">
      Lens is a system of storing, sharing, and collaborating on CAD models.
      <v-spacer />
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'LensHome',
  components: { },
  data: () => ({
  }),
  async created() {
    if (this.userCurrentOrganization) {
      if (this.userCurrentOrganization.type === 'Personal') {
        this.$router.push({ name: 'UserWorkspaces', params: { id: this.user.username } });
      } else {
        this.$router.push({ name: 'OrganizationWorkspaces', params: { id: this.userCurrentOrganization.refName } });
      }
    } else {
      this.$router.push({ name: 'UserWorkspaces', params: { id: this.user.username } });
    }
  },
  async mounted() {
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
  },
  methods: {
  }
}
</script>
<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
