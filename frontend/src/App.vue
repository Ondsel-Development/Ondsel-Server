<template>
  <v-app>
    <AppBar v-if="!$route.meta.isWindowLoadedInIframe"/>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from '@/layouts/default/AppBar';

export default {
  name: 'App',
  components: {AppBar},
  data: () => ({
  }),
}

</script>
