<template>
  <v-list
    v-model:opened="open"
    v-model:selected="active"
    width="250"
    height="90%"
    select-strategy="independent"
    style="position: absolute; top: 70px; background: transparent;"
  >
    <v-list-group value="Objects">
      <template v-slot:activator="{ props }">
        <v-list-item
            v-bind="props"
            title="List of objects"
        ></v-list-item>
      </template>
      <v-list-item
        v-for="object3d of objects3d"
        :title="object3d.name || 'Default'"
        :value="object3d"
        @click.stop="objectSelected(object3d)"
      >
        <template #append>
          <v-btn
            :icon="object3d.object3d.visible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
            variant="text"
            flat
            @click.stop="object3d.object3d.visible = !object3d.object3d.visible"
          />
        </template>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>

<script>
import _ from 'lodash';

export default {
  name: "ObjectsListView",
  props: {
    viewer: Object,
  },
  data: () => ({
    open: ['Objects'],
    active: [],
  }),
  computed: {
    objects3d: vm => _.get(vm.viewer, 'model.objects', [])
  },
  methods: {
    objectSelected(object3d) {
      this.viewer.selectGivenObject(object3d);
    },
    selectListItem(object3d) {
      const index = this.active.indexOf(object3d);
      if (index > -1) {
        this.active.splice(index, 1);
      } else {
        this.active.push(object3d);
      }
    }
  }
}

</script>

<style scoped>

</style>
