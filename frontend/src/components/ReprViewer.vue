<template>
  <div v-if="!curation?.representativeFile">
    <v-card
      width="8em"
      height="8em"
      flat
      variant="outlined"
    >
      <template v-slot:prepend>
        <v-avatar size="5.6em">
          <v-icon :icon="defaultIconForCollection(curation?.collection)" size="5em"></v-icon>
        </v-avatar>
      </template>
    </v-card>
  </div>
  <div v-else>
    <div v-if="curation?.representativeFile?.thumbnailUrlCache">
      <v-card
        width="8em"
        height="8em"
        flat
        variant="outlined"
      >
        <v-img
          :src="curation?.representativeFile?.thumbnailUrlCache"
          height="7.8em"
          width="7.8em"
        ></v-img>
      </v-card>
    </div>
    <div v-if="!curation?.representativeFile?.thumbnailUrlCache">
      <v-card
        width="8em"
        height="8em"
        flat
        variant="outlined"
      >
        <template v-slot:prepend>
          <v-avatar size="5em">
            <v-icon icon="mdi-file-outline" size="4em"></v-icon>
          </v-avatar>
        </template>
        <span class="mx-6"><code>.{{curation?.representativeFile?.custFileName.split('.').pop()}}</code></span>
      </v-card>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ReprViewer',
  props: {
    curation: {
      type: Object,
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
    defaultIconForCollection(collection) {
      let mdiIcon = 'mdi-help-circle';
      switch (collection) {
        case 'workspaces':
          mdiIcon = 'mdi-file-outline';
          break;
        case 'organizations':
          mdiIcon = 'mdi-account-group';
          break;
        case 'users':
          mdiIcon = 'mdi-account';
          break;
        default:
          break;
      }
      return mdiIcon;
    }
  }
}
</script>
