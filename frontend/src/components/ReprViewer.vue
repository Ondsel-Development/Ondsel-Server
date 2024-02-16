<template>
  <div v-if="!workspace.curation?.representativeFile">
    <v-card
      width="8em"
      height="8em"
      flat
      variant="outlined"
    >
      <template v-slot:prepend>
        <v-avatar>
          <v-icon icon="mdi-crop-square" size="x-large"></v-icon>
        </v-avatar>
      </template>
    </v-card>
  </div>
  <div v-else>
    <div v-if="workspace.curation?.representativeFile?.thumbnailUrlCache">
      <v-card
        width="8em"
        height="8em"
        flat
        variant="outlined"
      >
        <v-img
          :src="workspace.curation?.representativeFile?.thumbnailUrlCache"
          height="7.8em"
          width="7.8em"
        ></v-img>
      </v-card>
    </div>
    <div v-if="!workspace.curation?.representativeFile?.thumbnailUrlCache">
      <v-card
        width="8em"
        height="8em"
        flat
        variant="outlined"
      >
        <template v-slot:prepend>
          <v-avatar>
            <v-icon icon="mdi-file-outline" size="x-large"></v-icon>
          </v-avatar>
        </template>
        <span class="mx-6"><code>.{{workspace.curation?.representativeFile?.custFileName.split('.').pop()}}</code></span>
      </v-card>
    </div>
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
