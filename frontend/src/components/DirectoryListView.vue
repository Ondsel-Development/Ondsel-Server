<template>
  <v-list v-if="directory" density="compact" class="ml-2">
    <template
      v-for="dir in directory.directories"
      :key="dir._id"
    >
      <v-list-item
        variant="flat"
        class="show-indent"
      >
        <template v-slot:prepend>
          <v-btn
            color="decoration"
            flat
            :icon="openDirectories.find(d => d._id === dir._id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
            size="x-small"
            @click="toggleDirectory(dir)"
          ></v-btn>
        </template>
        <template v-slot:append>
          <v-btn
            color="decoration"
            flat
            icon="mdi-dots-vertical"
            size="x-small"
          ></v-btn>
        </template>
        <v-list-item-media>
          <v-card
            @click="$emit('selectedDirectory', dir, getItemPath(dir.name));"
          >
            <v-card-text>
              <span class="text-body-2">{{ dir.name }}</span>
            </v-card-text>
          </v-card>
        </v-list-item-media>
      </v-list-item>
      <directory-list-view
        v-if="openDirectories.find(d => d._id === dir._id)"
        :directory="openDirectories.find(d => d._id === dir._id)"
        :parent-directory-path="getItemPath(dir.name)+'/'"
        @selected-directory="(dir, dirPath) => $emit('selectedDirectory', dir, dirPath)"
      />
    </template>
  </v-list>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'DirectoryListView',
  emits: ['selectedDirectory'],
  props: {
    directory: Object,
    parentDirectoryPath: String,
  },
  data: () => ({
    openDirectories: [],
    openRootDirectory: true,
  }),
  computed: {
  },
  methods: {
    ...mapActions('app', [
      'getDirectoryByIdPublic',
    ]),
    getItemPath(item) {
      return `${this.parentDirectoryPath}${item}`;
    },
    async toggleDirectory(directorySubdocs) {
      const index = this.openDirectories.findIndex(d => d._id === directorySubdocs._id);
      if (index > -1) {
        this.openDirectories.splice(index, 1);
        return;
      }
      const directory = await this.getDirectoryByIdPublic(directorySubdocs._id);
      this.openDirectories.push(directory);
    },
    toggleRootDirectory() {
      this.openRootDirectory = !this.openRootDirectory;
    }
  },
};
</script>

<style scoped>
.show-indent {
  border-left-style: solid;
  border-left-color: grey;
  border-left-width: 1px;
}
</style>
