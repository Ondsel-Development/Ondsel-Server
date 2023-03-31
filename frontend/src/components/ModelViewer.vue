<template>
  <div ref="modelViewer" />
</template>

<script>
import { Viewer } from '@/threejs/viewer';

export default {
  name: 'ModelViewer',
  props: {
    objUrl: String,
  },
  data: () => ({
    obj: null,
  }),
  computed: {
    viewport3d: vm => vm.$refs.modelViewer,
    viewerWidth: () => window.innerWidth - 64,
    viewerHeight: () => window.innerHeight - 64,
  },
  mounted() {
    this.init();
  },
  created() {
  },
  methods: {
    init() {
      this.viewer = new Viewer(
        this.objUrl,
        this.viewerWidth,
        this.viewerHeight,
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
