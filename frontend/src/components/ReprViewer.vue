<template>
  <div v-if="workspace.curation.representativeFile.thumbnailUrlCache">
    <v-img
      :src="workspace.curation.representativeFile.thumbnailUrlCache"
      height="10em"
      width="10em"
    ></v-img>
  </div>
  <div v-if="!workspace.curation.representativeFile.thumbnailUrlCache">
    <v-card
      max-width="10em"
      height="10em"
      flat
      variant="outlined"
    >
      <template v-slot:prepend>
        <v-avatar>
          <v-icon icon="mdi-file-outline" size="x-large"></v-icon>
        </v-avatar>
      </template>
      <span class="mx-6"><code>.{{workspace.curation.representativeFile.custFileName.split('.').pop()}}</code></span>
    </v-card>
  </div>
</template>

<script>

export default {
  name: 'ReprViewer',
  props: {
    // objUrl: String,
    workspace: {
      type: Object,
      default: false,
    },
  },
  data: () => ({
  }),
  computed: {
  },
  mounted() {
  },
  created() {
  },
  methods: {
  }
}
</script>
