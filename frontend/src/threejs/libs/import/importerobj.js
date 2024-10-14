import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OBJ_COLOR, EDGE_COLOR } from '@/threejs/libs/constants';
import {ModelObject3D, ModelObjectType} from '@/threejs/libs/model/object';
import { Model } from '@/threejs/libs/model/model';

export class ImporterObj {

  constructor() {
    this.model = new Model ();
    this.file = null;
    this.objLoader = new OBJLoader();
    this.objects = [];
  }

  CanImportExtension(extension) {
    return extension.toUpperCase() === 'OBJ';
  }

  Reset() {
    this.model = new Model ();
    this.file = null;
    this.objects = [];
  }

  LoadFile(fileUrl, callback) {
    this.file = fileUrl;
    this.Reset();
    const lineSegments = new THREE.Object3D();
    this.objLoader.load(
      fileUrl,
      // called when resource is loaded
      (object) => {
        let object3d = new ModelObject3D ();
        object3d.SetType(ModelObjectType.Shape);
        object.traverse((child) => {
          if ( child instanceof THREE.Mesh ) {
            child.material = new THREE.MeshPhongMaterial({color: OBJ_COLOR})
          } else if ( child instanceof THREE.LineSegments ) {
            const line = new THREE.LineSegments(
              child.geometry.clone(),
              new THREE.LineBasicMaterial({ color: EDGE_COLOR, linewidth: 1}),
            );
            lineSegments.add(line);
          }
        })
        object.add(lineSegments);
        object3d.SetObject3d(object);
        this.model.AddObject(object3d);
        callback(this.model);
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
}
