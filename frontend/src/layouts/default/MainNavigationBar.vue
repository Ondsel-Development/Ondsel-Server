<template>
  <v-navigation-drawer v-model="drawer" permanent style="background: #fafafa; border: none;">
    <v-btn variant="outlined" class="ma-4" size="x-large" height="80px" color="#f1f2f2" style="background: #ffffff; border-width: 2px">
      <v-sheet class="d-flex align-start flex-column" style="background: inherit;" width="160">
        <span class="text-caption">Organization</span>
        <span class="text-h6">Personal</span>
      </v-sheet>
      <template v-slot:append>
        <v-icon icon="mdi-arrow-up-down" size="x-small" color="black" />
      </template>
    </v-btn>
    <v-text-field
      class="ma-4"
      append-inner-icon="mdi-magnify"
      density="compact"
      label="Search..."
      variant="outlined"
      hide-details
      single-line
    ></v-text-field>
    <v-list class="mx-4">
      <v-list-item
        v-for="[icon, text] in mainItems"
        :key="icon"
        :prepend-icon="icon"
        link
      >
        <template #title>
          <span style="color: black;">{{ text }}</span>
        </template>
      </v-list-item>
    </v-list>
    <template #append>
      <v-list class="mx-4">
        <v-list-item
          v-for="[icon, text] in secondaryItems"
          :key="icon"
          :prepend-icon="icon"
          link
        >
          <template #title>
            <span style="color: black;">{{ text }}</span>
          </template>
          <template #prepend>
            <v-icon size="small" />
          </template>
        </v-list-item>
      </v-list>
      <span class="d-flex justify-center text-caption mb-4">@ 2024 Ondsel, inc.</span>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "MainNavigationBar",
  data: () => ({
    mainItems: [
      ['mdi-home-outline', 'Home'],
      ['mdi-share-variant-outline', 'Workspaces'],
      ['mdi-cube-outline', 'Models'],
      ['mdi-dots-square', 'Public Models'],
    ],
    secondaryItems: [
      ['mdi-bookmark-outline', 'Bookmarks'],
      ['mdi-emoticon-happy-outline', 'Community'],
      ['mdi-help-circle-outline', 'Help'],
    ],
    drawer: null,
  }),
}
</script>


<style scoped>

</style>
