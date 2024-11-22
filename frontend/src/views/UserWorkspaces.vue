<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <Main>
    <template #title>
      <v-icon>mdi-folder-multiple-outline</v-icon>
      Personal Workspaces
    </template>
    <template #content>
      <v-container v-if="organization">
        <v-sheet class="d-flex flex-row justify-end">
          <div class="align-end">
            <v-btn color="secondary" variant="elevated" @click="$refs.createWorkspace.$data.dialog = true;">Create Workspace</v-btn>
          </div>
        </v-sheet>
        <v-sheet
          class="d-flex flex-wrap flex-row"
        >
          <workspace-view-sheet
            v-for="workspace in workspaces.data"
            :key="workspace._id"
            :workspace="workspace"
            :is-org="false"
            :username="username"
          ></workspace-view-sheet>
        </v-sheet>
        <create-workspace-dialog ref="createWorkspace" :organization="organization" />
      </v-container>
      <v-row dense class="justify-center">
        <template v-if="isFindPending">
          <v-progress-circular indeterminate></v-progress-circular>
        </template>
        <template v-else-if="workspaces.data?.length === 0">
          <div class="text-grey-darken-1">There are no workspaces here!</div>
        </template>
        <template v-else-if="workspaces.data?.length === paginationData[orgName]?.total">
          <div class="text-grey-darken-1">You reached the end!</div>
        </template>
        <template v-else>
          <v-btn flat variant="text" @click.stop="fetchDataOnScroll">Load more</v-btn>
        </template>
      </v-row>
    </template>
  </Main>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';
import CreateWorkspaceDialog from '@/components/CreateWorkspaceDialog.vue';
import scrollListenerMixin from '@/mixins/scrollListenerMixin';
import WorkspaceViewSheet from "@/components/WorkspaceViewSheet.vue";
import Main from '@/layouts/default/Main.vue';

const { Organization, Workspace } = models.api;

export default {
  name: 'UserWorkspaces',
  components: {WorkspaceViewSheet, CreateWorkspaceDialog, Main },
  mixins: [scrollListenerMixin],
  data: () => ({
    paginationData: {},
    orgSrc: null,
    orgName: "",
  }),
  async created() {
    this.orgName = this.user._id.toString();
    if (this.username !== this.user.username) { // this page should only be seen by the actual user
      this.$router.push({ name: 'PermissionError', params: {slug: this.username, urlCode: `/user/${this.username}/workspaces`}})
    }
    if (this.userCurrentOrganization.refName !== this.user._id.toString()) { // this page should only be seen by the actual user
      this.$router.push({ name: 'PermissionError', params: {slug: this.username, urlCode: `/user/${this.username}/workspaces`}})
    }
    this.orgSrc = await this.getOrgByIdOrNamePublic(this.orgName);
    this.initPagination(this.orgName);
    try {
      await Organization.get(this.orgName);
    } catch (e) {
      if (e.data?.type === 'PermissionError') {
        this.$router.push({ name: 'PageNotFound' });
      } else if (e.toString().startsWith('NotFound')) {
        this.$router.push({ name: 'PageNotFound' });
      } else {
        console.log(e.data);
        console.log(e);
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    // Use a callback with "next" to pass the instantiated component
    next(vm => { vm.setupScrollListener(); });
  },

  beforeRouteLeave(to, from, next) {
    this.removeScrollListener();
    next();
  },
  async mounted() {
    await this.fetchDataOnScroll();
  },
  computed: {
    ...mapState('workspaces', ['isFindPending']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    username: vm => vm.$route.params.id,
    workspaces: vm => Workspace.findInStore({ query: { $limit: 20, "organization.refName": vm.user._id.toString() } }),
    organization: vm => vm.orgSrc,
  },
  methods: {
    ...mapActions('app', ['getOrgByIdOrNamePublic']),
    initPagination(id) {
      if (!(id in this.paginationData)) {
        this.paginationData[id] = {
          limit: 50,
          skip: 0,
          total: null,
        };
      }
    },
    async fetchDataOnScroll() {
      if (this.isFindPending) {
        return;
      }
      this.orgSrc = await this.getOrgByIdOrNamePublic(this.orgName);
      this.initPagination(this.orgName);
      if (this.workspaces.data.length !== this.paginationData[this.orgName].total) {
        const workspaces = await Workspace.find({
          query: {
            $limit: this.paginationData[this.orgName].limit,
            $skip: this.paginationData[this.orgName].skip,
            "organization.refName": this.orgName,
          }
        });
        this.paginationData[this.orgName].skip = workspaces.skip + this.paginationData[this.orgName].limit;
        this.paginationData[this.orgName].total = workspaces.total;
      }
    },
  },
  watch: {
    async '$route'(to, from) {
      if (to.name === 'UserWorkspaces') {
        await this.fetchDataOnScroll();
      }
    }
  }
}
</script>

<style scoped>
</style>
