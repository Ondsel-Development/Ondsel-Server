<template>
  <metainfo>
  </metainfo>
  <v-app>
    <AppBar v-if="!$route.meta.isWindowLoadedInIframe"/>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from './layouts/default/AppBar';
import { useMeta } from 'vue-meta'

export default {
  name: 'App',
  components: {AppBar},
  data: () => ({
  }),
  setup () {
    useMeta({
      title: 'Ondsel Lens',
      htmlAttrs: { lang: 'en', amp: true }
    })
  }
}

</script>
