import * as THREE from 'three';
// import * as occtimportjs from 'occt-import-js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { fitCameraToSelection, getSelectedObject } from '@/threejs/cameraUtils'

const OBJ_COLOR = 0xcccccc;
const OBJ_HIGHLIGHTED_COLOR = 0x76ff90;
const EDGE_COLOR = 0x000000;

const ViewerConfig = {
  showEdges: false,
  showAxisHelper: true,
}

export class Viewer {

  constructor(url, width, height, viewport, window, onLoadCallback) {
    this.url = url;
    this.width = width;
    this.height = height;
    this.viewport = viewport;
    this.window = window;
    this.obj = null;
    this.lineSegments = null;
    this.axisHelper = null
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    this.camera = null;
    this.objLoader = new OBJLoader();
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.selectedObjs = []
    this.onLoadCallback = onLoadCallback;

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
      1, -1, 1
    );
    this.scene.add(this.camera);

    this.createLights();

    this.initControls();

    this.loadOBJ();

    // this.viewport.addEventListener('touchend', this.onPointerMove);
    this.viewport.addEventListener('mousedown', this.onPointerClicked.bind(this));
    // this.window.addEventListener('touchend', this.onPointerMove);
    // this.window.addEventListener('mouseup', this.onPointerMove.bind(this));

    this.animate()
  }

  animate() {
    requestAnimationFrame( this.animate.bind(this));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.camera.add(pointLight);
  }

  loadOBJ() {
    this.objLoader = new OBJLoader();

    if (this.obj) {
      this.scene.remove(this.obj);
    }
    if (this.lineSegments) {
      this.scene.remove(this.lineSegments);
    }
    this.lineSegments = new THREE.Group()

    let fileUrl = 'http://localhost:3000/dist/cube_gui.brep';

    let worker = new Worker('/dist/occt-import-js/dist/occt-import-js-worker.js');

    worker.addEventListener ('message', (ev) => {
      let mainObject = new THREE.Object3D();
      for (let resultMesh of ev.data.meshes) {
        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3));
        if (resultMesh.attributes.normal) {
          geometry.setAttribute('normal', new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3));
        }
        const index = Uint32Array.from(resultMesh.index.array);
        geometry.setIndex(new THREE.BufferAttribute(index, 1));
        let material = new THREE.MeshPhongMaterial({color: OBJ_COLOR})
        const mesh = new THREE.Mesh (geometry, material);
        mainObject.add(mesh);

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: EDGE_COLOR, linewidth: 1}),
        );
        this.lineSegments.add(line);
      }
      this.obj = mainObject;
      this.onFileConverted();
    });

    worker.addEventListener ('error', (ev) => {
      console.log(ev);
    });


    fetch(fileUrl).then(async response => {
      let buffer = await response.arrayBuffer ();
      let fileBuffer = new Uint8Array (buffer);
      worker.postMessage ({
        format : 'brep',
        buffer : fileBuffer
      });
    });
  }

  onFileConverted() {
    this.scene.add(this.obj);
    if (ViewerConfig.showEdges) {
      this.scene.add(this.lineSegments);
    }
    fitCameraToSelection(this.camera, this.controls, this.obj);
    if (!this.axisHelper) {
      this.addAxesHelper();
    }
    this.onLoadCallback();
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  addAxesHelper() {
    const box = new THREE.Box3();
    box.setFromObject(this.obj);
    const size = new THREE.Vector3();
    box.getSize(size)
    const maxSize = Math.max(size.x * 2, size.y * 2, size.z * 2);

    this.axisHelper = new THREE.AxesHelper( maxSize );
    if (ViewerConfig.showAxisHelper) {
      this.scene.add(this.axisHelper);
    }
  }

  fitCameraToObjects() {
    if (this.selectedObjs.length > 0) {
      fitCameraToSelection(this.camera, this.controls, this.selectedObjs);
    } else {
      fitCameraToSelection(this.camera, this.controls, this.obj);
    }
  }

  onPointerClicked(event) {
    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    const selectedObj = getSelectedObject(this.raycaster, this.camera, this.pointer, this.obj);
    if (selectedObj) {
      const objColorStr = selectedObj.material.color.getHexString();
      if (parseInt(objColorStr, 16) === parseInt(OBJ_COLOR)) {
        selectedObj.material.color.set(OBJ_HIGHLIGHTED_COLOR);
        if (!this.selectedObjs.includes(selectedObj)) {
          this.selectedObjs.push(selectedObj);
        }
      } else {
        selectedObj.material.color.set(OBJ_COLOR);
        const index = this.selectedObjs.indexOf(selectedObj);
        if (index > -1) {
          this.selectedObjs.splice(index, 1);
        }
      }
    }
  }

}
