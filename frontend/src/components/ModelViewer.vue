<template>
  <v-navigation-drawer rail location="right" permanent>
    <v-btn icon @click="fitModelToScreen">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
  </v-navigation-drawer>
  <div ref="modelViewer" />
</template>

<script>
import { Viewer } from '@/threejs/viewer';


export default {
  name: 'ModelViewer',
  data: () => ({
    objURL: 'example.obj',
    obj: null,
  }),
  computed: {
    viewport3d: vm => vm.$refs.modelViewer,
    width: () => window.innerWidth - 64,
    height: () => window.innerHeight - 64,
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.viewer = new Viewer(
        this.objURL,
        this.width,
        this.height,
        this.viewport3d,
        window,
      )
      this.viewport3d.appendChild(this.viewer.renderer.domElement);
    },

    fitModelToScreen() {
      this.viewer.fitCameraToObjects();
    },
  }
}
</script>
