<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div ref="modelViewer" />
</template>

<script>
import { Viewer } from '@/threejs/viewer';

export default {
  name: 'ModelViewer',
  props: {
    // objUrl: String,
    fullScreen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['model:loaded', 'object:clicked'],
  data: () => ({
    obj: null,
    objUrl: '',
  }),
  computed: {
    viewport3d: vm => vm.$refs.modelViewer,
    viewerWidth: (vm) => vm.fullScreen ? window.innerWidth : window.innerWidth - 64,
    viewerHeight: (vm) => vm.fullScreen ? window.innerHeight : window.innerHeight - 64,
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
        () => this.$emit('model:loaded', this.viewer),
        object3d => this.$emit('object:clicked', object3d)
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
