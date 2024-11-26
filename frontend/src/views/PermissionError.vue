<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">LENS</div>
      <v-spacer />
    </v-row>
    <br>
  </v-container>
  <v-container>
    <v-sheet
      class="d-flex align-center justify-center flex-wrap mx-auto px-4"
      elevation="4"
      rounded
      max-width="800"
      width="100%"
    >
      <div>
        <h2>504 Permission Error</h2>

        <div class="text-h5 mb-2" v-if="loggedInUser">
          You are <b>{{loggedInUser.user.name}}</b> [<code>{{loggedInUser.user.username}}</code>]
          <p>representing <b>{{userCurrentOrganization.name}}</b> {{selfRef}}</p>
        </div>

        <div class="text-h5 mb-2" v-else>
          You are an anonymous user.
        </div>

        <div class="text-h5 mb-2">
          but you attempted to reach <b><code>{{url}}</code></b>
          <p>which only belongs to {{urlOrgType}} <b>{{orgName}}</b></p>
        </div>

        <p class="text-body-2 mb-4">
          That is a private page.
        </p>

        <p class="text-body-2 mb-4" v-if="loggedInUser && urlOrgType===`organization`" >
          If your account actually has access to that organization, then try switching to {{orgName}} first (see line at top of page).
        </p>

        <p class="text-body-2 mb-4" v-if="loggedInUser && urlOrgType===`user` && loggedInUser.user.username === orgName" >
          <b><i>This is your OWN account</i></b>. Simply switch to yourself first. (see line at top of page, then choose "Personal").
        </p>

        <p class="text-body-2 mb-4" v-if="urlOrgType===`organization`" >
          Visit home page for <a v-bind:href="`/org/${orgName}`">{{orgName}}</a>.
        </p>
        <p class="text-body-2 mb-4" v-if="urlOrgType===`user`" >
          Visit home page for <a v-bind:href="`/user/${orgName}`">{{orgName}}</a>.
        </p>
      </div>
    </v-sheet>
  </v-container>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'PermissionError',
  components: { },
  data: () => ({
  }),
  async created() {
  },
  async mounted() {
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    url: vm => vm.$route.params.urlCode,
    orgName: vm => vm.$route.params.slug,
    urlOrgType: vm => vm.$route.params.urlCode.startsWith("/user") ? "user" : "organization",
    selfRef: vm => vm.userCurrentOrganization.type === "Personal" ? "(yourself)" : `[${vm.userCurrentOrganization.refName}]`,
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
