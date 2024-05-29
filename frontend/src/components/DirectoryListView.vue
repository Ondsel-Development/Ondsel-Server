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
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                color="decoration"
                flat
                icon="mdi-dots-vertical"
                v-bind="props"
                size="x-small"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item @click="openCreateDirectoryDialog(dir)">
                <v-list-item-title><v-icon icon="mdi-plus" class="mx-2"></v-icon> Add New Subdirectory</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openDeleteDirectoryDialog(dir)">
                <v-list-item-title><v-icon icon="mdi-delete" class="mx-2"></v-icon> Delete This Directory</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <v-list-item-media>
          <v-sheet @click="$emit('selectedDirectory', dir, getItemPath(dir.name));">
            <span
              v-if="activeDirectory?._id === dir._id"
              class="text-body-2 mx-3"
            ><b>{{ dir.name }}</b></span>
            <span
              v-else
              class="text-body-2 mx-3"
            >{{ dir.name }}</span>
          </v-sheet>
        </v-list-item-media>
      </v-list-item>
      <directory-list-view
        v-if="openDirectories.find(d => d._id === dir._id)"
        :directory="openDirectories.find(d => d._id === dir._id)"
        :parent-directory-path="getItemPath(dir.name)+'/'"
        :active-directory="activeDirectory"
        @selected-directory="(dir, dirPath) => $emit('selectedDirectory', dir, dirPath)"
        @create-directory="emitCreateDirectory"
      />
    </template>
  </v-list>
  <create-directory-dialog ref="createDirectoryDialog" @create-directory="emitCreateDirectory" :parent-dir="targetDirectory"></create-directory-dialog>
  <delete-directory-dialog ref="deleteDirectoryDialog" @delete-directory="deleteDirectory" :directory-name="targetDirectory.name"></delete-directory-dialog>
</template>

<script>
import {mapActions} from "vuex";
import CreateDirectoryDialog from "@/components/CreateDirectoryDialog.vue";
import DeleteDirectoryDialog from "@/components/DeleteDirectoryDialog.vue";
import {models} from "@feathersjs/vuex";
const { Directory } = models.api;


export default {
  name: 'DirectoryListView',
  components: {DeleteDirectoryDialog, CreateDirectoryDialog},
  emits: ['selectedDirectory', 'createDirectory'],
  props: {
    directory: Object,
    parentDirectoryPath: String,
    activeDirectory: Object,
  },
  data: () => ({
    openDirectories: [],
    targetDirectory: {},
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
    async openCreateDirectoryDialog(newTargetDir) {
      this.targetDirectory = newTargetDir;
      this.$refs.createDirectoryDialog.$data.dialog = true;
    },
    async openDeleteDirectoryDialog(newTargetDir) {
      this.targetDirectory = newTargetDir;
      this.$refs.deleteDirectoryDialog.$data.dialog = true;
    },
    async emitCreateDirectory(dirName, parentDir) {
      // pass this up to the parent unmodified
      this.$emit('createDirectory', dirName, parentDir);
      this.$refs.createDirectoryDialog.$data.dialog = false;
    },
    async deleteDirectory() {
      await Directory.remove(
        this.targetDirectory._id
      ).then(() => {
        this.$refs.deleteDirectoryDialog.$data.dialog = false;
      }).catch((e) => {
        this.$refs.deleteDirectoryDialog.$data.snackerMsg = e.message;
        this.$refs.deleteDirectoryDialog.$data.showSnacker = true;
      });
    },
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
