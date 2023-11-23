<template>
  <v-app>
    <v-container>
      <directory-list-view :files="files" :openFolders="openFolders" />
    </v-container>
  </v-app>
</template>

<script>
import DirectoryListView from '@/components/DirectoryListView.vue'; // Adjust the path as needed

export default {
  name: 'DirectoryListViewPage',
  components: { DirectoryListView },
  data() {
    return {
      files: [
        {
          name: 'Folder 1',
          type: 'directory',
          isOpen: true,
          children: [
            { name: 'File 1-1', type: 'file' },
            {
              name: 'Folder 1-1',
              type: 'directory',
              isOpen: true,
              children: [{ name: 'File 1-1-1', type: 'file' }],
            },
          ],
        },
        { name: 'File 1', type: 'file' },
      ],
      openFolders: [],
    };
  },
  methods: {
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

