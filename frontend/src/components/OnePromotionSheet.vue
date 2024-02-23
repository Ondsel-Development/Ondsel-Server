<template>
  <v-sheet
    width="100%"
    elevation="8"
    max-width="120em"
    rounded="lg"
  >
    <v-container>
      <v-container>
        <div class="d-flex justify-lg-space-between">
          <v-sheet max-width="80em">
            <span class="text-blue-accent-1">{{message}}</span>
          </v-sheet>
          <v-sheet max-width="38em">
            {{translateCollection(curation.collection)}}
          </v-sheet>
        </div>
      </v-container>
      <div class="d-flex justify-start">
        <v-sheet width="10em">
          <repr-viewer :curation="curation"/>
        </v-sheet>
        <v-sheet>
          <p class="text-h6">{{ curation.name }}</p>
          <span class="text-body-2">{{ curation.description }}</span>
        </v-sheet>
      </div>
    </v-container>
  </v-sheet>
</template>

<script>

import ReprViewer from "@/components/ReprViewer.vue";

export default {
  name: "OnePromotionSheet",
  components: {ReprViewer},
  props: {
    curation: {
      type: Object,
      default: {
        collection: 'tbd',
        name: 'tbd',
        description: '',
      }
    },
    message: {
      type: String,
      default: '',
    },
  },
  async created() {
  },
  computed: {
  },
  data: () => ({
  }),
  methods: {
    translateCollection(collection) {
      let tr = '';
      switch (collection) {
        case 'workspaces':
          tr = 'workspace';
          break;
        case 'organizations':
          tr = 'organization';
          break;
        case 'users':
          tr = 'individual user';
          break;
        case 'shared-models':
          tr = 'shared CAD model';
          break;
      }
      return tr;
    }
  },
}
</script>

<style scoped>

</style>
