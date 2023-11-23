<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col>
          <v-list two-line>
            <template v-for="item in files">
              <v-list-item :key="item.name" v-if="item.type === 'file'">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item :key="item.name" v-else>
                <v-list-item-content>
                  <v-list-item-title @click="toggleFolder(item)">
                    <v-icon>{{ openFolders.includes(item) ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
                    {{ item.name }}
                  </v-list-item-title>
                </v-list-item-content>

<!--                {{ openFolders.includes(item) }}-->
                <directory-list-view :files="item.children" :openFolders="openFolders" v-if="openFolders.includes(item)" />

<!--                <v-list-group :value="openFolders.includes(item)" @input="toggleFolder(item)" :prepend-icon="openFolders.includes(item) ? 'mdi-folder-open' : 'mdi-folder'">-->
<!--                  <template v-slot:activator>-->
<!--                    &lt;!&ndash; Empty activator to prevent clicking on the list item itself &ndash;&gt;-->
<!--                  </template>-->

<!--                  <v-list>-->
<!--                    <v-list-item-content>-->
<!--                      <v-list-item-title>-->
<!--                        yes yes-->
<!--                      </v-list-item-title>-->
<!--                    </v-list-item-content>-->
<!--                    {{ openFolders.includes(item) }}-->
<!--                    &lt;!&ndash; Use the component directly here &ndash;&gt;-->
<!--                    <directory-list-view :files="item.children" :openFolders="openFolders" v-if="openFolders.includes(item)" />-->
<!--                  </v-list>-->
<!--                </v-list-group>-->
              </v-list-item>
            </template>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'DirectoryListView',
  props: {
    files: Array,
    openFolders: Array,
  },
  methods: {
    toggleFolder(folder) {
      const index = this.openFolders.indexOf(folder);
      if (index !== -1) {
        this.openFolders.splice(index, 1);
      } else {
        this.openFolders.push(folder);
      }
    },
  },
};
</script>
