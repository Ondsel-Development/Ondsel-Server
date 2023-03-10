<template>
  <v-card>
    <v-layout>
      <AppBar />

<!--      <v-navigation-drawer rail location="right" permanent>-->
<!--          <v-btn icon>-->
<!--            <v-icon>mdi-magnify</v-icon>-->
<!--          </v-btn>-->
<!--      </v-navigation-drawer>-->

      <v-main>
        <router-view/>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script>
import AppBar from './layouts/default/AppBar';

export default {
  name: 'App',
  components: {AppBar},
  data: () => ({
  }),
}

</script>
