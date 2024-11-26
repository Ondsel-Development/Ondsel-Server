<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-container fluid class="fill-height">
    <v-row class="text-center">
      <v-col class="mb-4">
        <div class="text-h1">404</div>
        <h1 class="text-h4">Page Not Found!</h1>

        <div class="text-body-1 mt-6">The page you are looking for does not exist.</div>
        <div class="text-body-1">Please check the URL or navigate back to the homepage.</div>
        <br>
        <v-btn color="link" variant="text" to="/">Go to Homepage</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'PageNotFound',
};
</script>

<style scoped>
</style>
