<template>
  <v-list v-model:opened="open" width="250" height="400" style="position: absolute; top: 70px">
    <v-list-group value="Objects">
      <template v-slot:activator="{ props }">
        <v-list-item
            v-bind="props"
            title="List of objects"
        ></v-list-item>
      </template>
      <v-list-item
        v-for="object3d of objects3d"
        :title="object3d.name"
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
    open: [],
  }),
  computed: {
    objects3d: vm => _.get(vm.viewer, 'model.objects', [])
  },
}

</script>

<style scoped>

</style>
