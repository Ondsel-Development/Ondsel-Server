import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { fitCameraToSelection } from '@/threejs/cameraUtils'

export class Viewer {

  constructor(url, width, height) {
    this.url = url;
    this.width = width;
    this.height = height;
    this.obj = null;
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    this.camera = null;
    this.objLoader = new OBJLoader();

    this.initViewer();
  }

  initViewer() {
    const VIEW_ANGLE = 45;
    const ASPECT = this.width / this.height;
    const NEAR = 0.1;
    const FAR = 20000;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setClearColor(0xFFFF00, 0); // the default
    this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    this.renderer.setSize(this.width, this.height);

    this.camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE, // Field of view
      ASPECT, // Aspect ratio
      NEAR, // Near plane
      FAR, // Far plane
    );
    this.camera.position.set(
      0, 0, 1
    );
    this.scene.add(this.camera);

    this.createLights();

    this.initControls();

    this.loadOBJ();

    this.animate()
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame( this.animate.bind(this));
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.camera.add(pointLight);
  }

  loadOBJ() {
    this.objLoader = new OBJLoader();

    this.objLoader.load(
      this.url,
      // called when resource is loaded
      (object) => {
        this.obj = object
        object.traverse((child) => {
          if ( child instanceof THREE.Mesh ) {
            child.material.color = new THREE.Color('rgb(222, 49, 99)')
            // child.material.side = THREE.DoubleSide;
            if (child.geometry !== undefined) {
              const edges = new THREE.EdgesGeometry(child.geometry);
              const line = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xFFC0CB }),
              );

              this.scene.add(line);
            }
          }
        })
        this.scene.add(object);

        this.addAxesHelper();

        fitCameraToSelection(this.camera, this.controls, null, this.obj);
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
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  addAxesHelper() {
    const box = new THREE.Box3();
    box.setFromObject(this.obj);
    const size = new THREE.Vector3();
    box.getSize(size)
    const maxSize = Math.max(size.x, size.y, size.z);

    const axesHelper = new THREE.AxesHelper( maxSize );
    this.scene.add( axesHelper );
  }

  fitCameraToObjects() {
    fitCameraToSelection(this.camera, this.controls, null, this.obj);
  }

}
