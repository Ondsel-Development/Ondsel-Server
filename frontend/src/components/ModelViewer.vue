<template>
  <div ref="modelViewer" />
</template>

<script>
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export default {
  name: 'ModelViewer',
  data: () => ({
    mtlURL: 'example2.mtl',
    objURL: 'example.obj',
  }),
  computed: {
    viewport3d: vm => vm.$refs.modelViewer,
    width: () => window.innerWidth,
    height: () => window.innerHeight,
  },
  mounted() {
    // this.customInit();
    this.init();
  },
  methods: {
    createLights() {
      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
      this.scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 0.8);
      this.camera.add(pointLight);
    },
    init() {
      this.scene = new THREE.Scene();

      const VIEW_ANGLE = 35;
      const ASPECT = this.width / this.height;
      const NEAR = 0.1;
      const FAR = 20000;

      this.renderer = new THREE.WebGLRenderer({
        // antialias: true,
        // alpha: true,
        // preserveDrawingBuffer: true
      });
      this.renderer.setClearColor(0x000000, 0); // the default
      this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);
      this.renderer.setSize(this.width, this.height);

      this.viewport3d.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(
        VIEW_ANGLE, // Field of view
        ASPECT, // Aspect ratio
        NEAR, // Near plane
        FAR, // Far plane
      );

      this.camera.position.set(
        0, 0, 50
      );

      this.createLights();
      this.scene.add(this.camera);

      this.initControls();

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      const cube = new THREE.Mesh(geometry, material);
      this.scene.add(cube);

      this.loadOBJ();

      this.animate();
    },
    loadOBJ() {
      this.mtlLoader = new MTLLoader();
      this.objLoader = new OBJLoader();

      const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      this.mtlLoader.load(
        this.mtlURL,
        (materials) => {
          materials.preload();
          // const mat = new THREE.ShaderMaterial();
          // this.objLoader.setMaterials(materials);

          this.objLoader.load(
            this.objURL,
            // called when resource is loaded
            (object) => {
              // object.traverse((child) => {
              //   if ( child instanceof THREE.Mesh ) {
              //     console.log(child);
              //     child.setMaterial(material)
              //     child.material.ambient.setHex(0xFF0000);
              // child.material.color.setHex(0x00FF00);
              // }
              // })
              this.scene.add(object);
            },
            // called when loading is in progresses
            function (xhr) {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
              console.log('An error happened');
            }
          );
        });
    },
    animate() {
      requestAnimationFrame(this.animate);

      this.controls.update();

      this.renderer.render(this.scene, this.camera);
    },
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },
  }
}
</script>
