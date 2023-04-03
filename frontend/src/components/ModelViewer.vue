<template>
  <div ref="modelViewer" />
</template>

<script>
import { Viewer } from '@/threejs/viewer';

export default {
  name: 'ModelViewer',
  props: {
    // objUrl: String,
  },
  data: () => ({
    obj: null,
    objUrl: '',
  }),
  computed: {
    viewport3d: vm => vm.$refs.modelViewer,
    viewerWidth: () => window.innerWidth - 64,
    viewerHeight: () => window.innerHeight - 64,
  },
  mounted() {
    // this.init();
  },
  created() {
  },
  methods: {
    init(objUrl) {
      this.objUrl = objUrl;
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

    reloadOBJ(objUrl) {
      this.objUrl = objUrl;
      this.viewer.loadOBJ();
    }

  }
}
</script>
