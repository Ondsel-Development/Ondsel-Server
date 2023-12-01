<template>
  <v-list v-if="rootDirectory" density="compact">
    <v-list-item variant="flat" @click="toggleRootDirectory(); $emit('selectedDirectory', rootDirectory, rootDirectory.name);">
      {{ rootDirectory.name }}
    </v-list-item>
    <directory-list-view
      v-if="openRootDirectory"
      :directory="rootDirectory"
      :parent-directory-path="rootDirectory.name"
      @selected-file="(file, filePath) => $emit('selectedFile', file, filePath)"
      @selected-directory="(dir, dirPath) => $emit('selectedDirectory', dir, dirPath)"
    />
  </v-list>
  <v-list v-if="directory" density="compact">
    <v-list-item
      v-for="file in directory.files"
      :key="file._id"
      :value="file"
      variant="flat"
    >
      <v-list-item-title
        class="text-body-2"
        @click="$emit('selectedFile', file, getItemPath(file.custFileName))"
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
          @click="toggleDirectory(dir); $emit('selectedDirectory', dir, getItemPath(dir.name));"
        >
          {{ getItemPath(dir.name) }}
        </v-list-item-title>
      </v-list-item>
      <directory-list-view
        v-if="openDirectories.find(d => d._id === dir._id)"
        :directory="openDirectories.find(d => d._id === dir._id)"
        :parent-directory-path="getItemPath(dir.name)+'/'"
        @selected-file="(file, filePath) => $emit('selectedFile', file, filePath)"
        @selected-directory="(dir, dirPath) => $emit('selectedDirectory', dir, dirPath)"
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
    rootDirectory: {
      required: false,
      type: Object,
    },
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
    },
    toggleRootDirectory() {
      this.openRootDirectory = !this.openRootDirectory;
    }
  },
};
</script>
