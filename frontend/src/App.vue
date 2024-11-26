<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-app>
    <MainNavigationBar v-if="!$route.meta.isWindowLoadedInIframe"/>
    <v-main class="my-4 mx-2">
      <v-sheet class="fill-height" style="background: #ffffff;" border rounded="lg">
        <router-view/>
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script>
import MainNavigationBar from '@/layouts/default/MainNavigationBar.vue';

export default {
  name: 'App',
  components: { MainNavigationBar },
  data: () => ({
  }),
}

</script>
