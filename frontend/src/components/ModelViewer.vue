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
    width: () => window.innerWidth - 64,
    height: () => window.innerHeight - 64,
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
