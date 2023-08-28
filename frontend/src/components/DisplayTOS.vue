<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card>
      <v-card-title>{{doc}}</v-card-title>
      Hello
    </v-card>
  </v-dialog>
</template>

<script>


import agreements from "@/store/services/agreements";

export default {
  name: 'DisplayTOS',
  emits: [],
  props: {
    isActive: Boolean,
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
    doc: () => {
      return agreements.find({
        query: {category: 'terms-of-service'}
      });
    },
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
