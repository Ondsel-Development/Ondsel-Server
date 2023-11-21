
<template>
  <v-app>
    <v-container>
      <v-list>
        <template v-for="(item, index) in currentItems" :key="index">
          <v-list-item @click="handleItemClick(item)">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <template v-if="item.type === 'directory' && item.isOpen">
            <v-list-item-group>
              <v-list-item v-for="(child, childIndex) in item.children" :key="childIndex">
                <v-list-item-content>
                  <v-list-item-title>{{ child.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </template>
        </template>
      </v-list>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      currentItems: [
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
        // Add more items as needed
      ],
    };
  },
  methods: {
    handleItemClick(item) {
      if (item.type === 'directory') {
        item.isOpen = !item.isOpen;
      }
    },
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
