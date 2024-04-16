<template>
  <v-sheet
    elevation="8"
    rounded="lg"
  >
    <v-container class="d-flex flex-column">
      <div class="d-flex justify-space-between">
        <v-sheet max-width="22em" class="align-self-start mb-1">
          <span style="color: blue;">{{message}}</span>
        </v-sheet>
        <v-sheet max-width="22em" class="align-self-end">
          {{translateCollection(curation.collection)}}
        </v-sheet>
      </div>
      <div class="d-flex flex-wrap justify-start">
        <v-sheet width="10em">
          <repr-viewer :curation="curation"/>
        </v-sheet>
        <v-sheet>
          <p class="text-h6">{{ curation.name }}</p>
          <p><code class="text-blue">{{curation.slug}}</code></p>
          <p class="text-body-2">{{ curation.description }}</p>
          <v-chip-group>
            <v-chip v-for="(tag) in curation?.tags" size="small">{{tag}}</v-chip>
          </v-chip-group>
        </v-sheet>
      </div>
    </v-container>
  </v-sheet>
</template>

<script>

import ReprViewer from "@/components/ReprViewer.vue";
import {translateCollection} from "@/curationHelpers";

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
    translateCollection
  },
}
</script>

<style scoped>

</style>
