<template>
  <v-container>
    <v-row class="ma-4">
      <v-col>
        <v-row>
          <span class="text-h5">
            <slot name="title"></slot>
          </span>
        </v-row>
        <v-row>
          <span class="text-body-1">
            <slot name="subtitle"></slot>
          </span>
        </v-row>
      </v-col>
      <slot name="actions"></slot>
    </v-row>
    <slot name="content"></slot>
  </v-container>
</template>

<script>
export default {
  name: "Main"
}
</script>

<style scoped>

</style>
