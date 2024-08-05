<template>
  <v-treeview
    :items="treeViewItems"
    v-model="active"
    item-props
    slim
    selectable
    activatable
    open-on-click
    height="90%"
    density="compact"
    select-strategy="single-independent"
    style="position: absolute; top: 70px; background: transparent;"
  >
    <template v-slot:prepend="{ item, open }">
      <v-checkbox density="compact" hide-details />
      <v-btn
        :icon="item.visibility? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
        variant="text"
        flat
        @click.stop="toggleVisibility(item)"
      />
    </template>
    <template v-slot:append="{ item, open }">
      <v-btn
        v-if="linkedObjects.hasOwnProperty(item.realName)"
        icon="mdi-open-in-new"
        variant="text"
        @click.stop="openAssemblyObjectInfoDialog(item.realName)"
      />
    </template>
  </v-treeview>

  <!--<v-list
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
              v-if="linkedObjects.hasOwnProperty(object3d.realName)"
              icon="mdi-open-in-new"
              variant="text"
              @click.stop="openAssemblyObjectInfoDialog(object3d.realName)"
          />
          <v-btn
            :icon="object3d.object3d.visible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
            variant="text"
            flat
            @click.stop="object3d.object3d.visible = !object3d.object3d.visible"
          />
        </template>
      </v-list-item>
    </v-list-group>
  </v-list>-->
  <AssemblyObjectInfoDialog ref="assemblyObjectInfoDialog" />
</template>

<script>
import AssemblyObjectInfoDialog from '@/components/AssemblyObjectInfoDialog.vue';

export default {
  name: "ObjectsListView",
  emits: ['selectGivenObject'],
  components: {AssemblyObjectInfoDialog},
  props: {
    model: {
      type: Object,
      required: false,
    }
  },
  data: () => ({
    model3d: null,
    objects3d: [],
    linkedObjects: {},
    open: ['Objects'],
    active: [],
  }),
  computed: {
    treeViewItems() {
      function convertToTitleObject(modelObject) {
        let result = {
          id: modelObject.uuid,
          title: modelObject.name,
          uuid: modelObject.uuid,
          visibility: modelObject.GetVisibility(),
          realName: modelObject.GetRealName(),
        };

        if (modelObject.children.length > 0) {
          result.children = modelObject.children.map(child => convertToTitleObject(child));
        }

        return result;
      }
      return this.model3d ? this.model3d.GetRootObjects().map(root => convertToTitleObject(root)) : [];
    },
    activated() {
      return this.model3d ? this.model3d.GetRootObjects().map(m => m.uuid) : [];
    }
  },
  methods: {
    objectSelected(object3d) {
      this.$emit('selectGivenObject', object3d);
    },
    selectListItem(object3d) {
      const index = this.active.indexOf(object3d);
      if (index > -1) {
        this.active.splice(index, 1);
      } else {
        this.active.push(object3d);
      }
    },
    openAssemblyObjectInfoDialog(objectName) {
      if (this.model && this.linkedObjects.hasOwnProperty(objectName)) {
        this.$refs.assemblyObjectInfoDialog.openDialog(this.model.file.directory._id, this.linkedObjects[objectName]);
      }
    },
    toggleVisibility(item) {
      const object3d = this.model3d.findObjectByUuid(item.uuid);
      object3d.ToggleVisibility();
    },
  }
}

</script>

<style scoped>

</style>
