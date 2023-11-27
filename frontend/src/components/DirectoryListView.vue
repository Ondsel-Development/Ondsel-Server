<template>
  <v-list v-if="directory" density="compact">
    <v-list-item
      v-for="file in directory.files"
      :key="file._id"
      :value="file"
      variant="flat"
    >
      <v-list-item-title
        class="text-body-2"
        @click="$emit('selectedFile', file)"
      >
        {{ getItemPath(file.custFileName) }}
      </v-list-item-title>
    </v-list-item>
    <template
      v-for="dir in directory.directories"
      :key="dir._id"
    >
      <v-list-item
        variant="flat"
      >
        <template v-slot:prepend>
          <v-icon
            class="mr-1"
            :icon="openDirectories.find(d => d._id === dir._id) ? 'mdi-folder-open' : 'mdi-folder'"
          ></v-icon>
        </template>
        <v-list-item-title
          class="text-body-2"
          @click="toggleDirectory(dir); $emit('selectedDirectory', dir);"
        >
          {{ getItemPath(dir.name) }}
        </v-list-item-title>
      </v-list-item>
      <directory-list-view
        v-if="openDirectories.find(d => d._id === dir._id)"
        :directory="openDirectories.find(d => d._id === dir._id)"
        :parent-directory-path="getItemPath(dir.name)+'/'"
        @selected-file="file => $emit('selectedFile', file)"
        @selected-directory="dir => $emit('selectedDirectory', dir)"
      />
    </template>
  </v-list>
</template>

<script>
import { models } from '@feathersjs/vuex';

const { Directory } = models.api;

export default {
  name: 'DirectoryListView',
  emits: ['selectedFile', 'selectedDirectory'],
  props: {
    directory: Object,
    parentDirectoryPath: String,
  },
  data: () => ({
    openDirectories: [],
  }),
  computed: {
  },
  methods: {
    getItemPath(item) {
      return `${this.parentDirectoryPath}${item}`;
    },
    async toggleDirectory(directorySubdocs) {
      const index = this.openDirectories.findIndex(d => d._id === directorySubdocs._id);
      if (index > -1) {
        this.openDirectories.splice(index, 1);
        return;
      }
      await Directory.get(directorySubdocs._id);
      const directory = Directory.getFromStore(directorySubdocs._id);
      this.openDirectories.push(directory);
    }
  },
};
</script>
