import * as THREE from 'three';
import { OBJ_COLOR } from '@/threejs/libs/constants';
import { Model } from '@/threejs/libs/model/model';
import { ModelObject3D } from '@/threejs/libs/model/object';

export class ImporterStep {

  constructor() {
    this.model = new Model ();
    this.file = null;
    this.worker = null;
    this.objects = [];
  }

  CanImportExtension(extension) {
    return extension.toUpperCase() === 'STEP' || extension.toUpperCase() === 'STP';
  }

  Reset() {
    this.model = new Model ();
    this.file = null;
    if (this.worker !== null) {
      this.worker.terminate();
    }
    this.worker = null;
    this.objects = [];
  }

  LoadFile(fileUrl, callback) {
    this.file = fileUrl;
    this.Reset();
    fetch(fileUrl).then(async response => {
      let buffer = await response.arrayBuffer ();
      let fileBuffer = new Uint8Array (buffer);
      this.ImportContent(fileBuffer, callback);
    });
  }

  ImportContent (fileContent, onFinish) {

    this.worker = new Worker('/occt-import-js/dist/occt-import-js-worker.js');

    this.worker.addEventListener ('message', (ev) => {
      for (let resultMesh of ev.data.meshes) {

        let object3d = new ModelObject3D ();
        if (resultMesh.name) {
          object3d.SetName(resultMesh.name);
          object3d.SetRealName(resultMesh.name);
        }
        if (resultMesh.color) {
          object3d.SetColor(new THREE.Color(resultMesh.color[0], resultMesh.color[1], resultMesh.color[2]));
        } else {
          object3d.SetColor(new THREE.Color(OBJ_COLOR));
        }

        let mainObject = new THREE.Object3D();
        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3));
        if (resultMesh.attributes.normal) {
          geometry.setAttribute('normal', new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3));
        }
        const index = Uint32Array.from(resultMesh.index.array);
        geometry.setIndex(new THREE.BufferAttribute(index, 1));
        let material = new THREE.MeshPhongMaterial({color: object3d.GetColor()})
        const mesh = new THREE.Mesh (geometry, material);
        mainObject.add(mesh);
        object3d.SetObject3d(mainObject);
        this.model.AddObject(object3d);
      }

      // Create Tree Structure

      for (let root of ev.data.root.children) {
        let rootObj = this.model.GetObjectByName(root.name);
        if (!rootObj) {
          rootObj = new ModelObject3D();
          rootObj.SetName(root.name);
          rootObj.SetRealName(root.name);
          this.model.AddObject(rootObj);
        }
        for (let child of root.children) {
          let childObj = this.model.GetObjectByName(child.name);
          if (!childObj) {
            childObj = new ModelObject3D();
            childObj.SetName(child.name);
            childObj.SetRealName(child.name);
            this.model.AddObject(childObj);
          }
          rootObj.AddChildren(childObj);
          childObj.SetParent(rootObj);
          for (let index in child.children) {
            const indexObj = this.model.GetObjects()[index];
            childObj.AddChildren(indexObj);
            indexObj.SetParent(childObj);
          }

          for (let meshIndex of child.meshes) {
            const meshObj = this.model.GetObjects()[meshIndex]
            if (childObj.GetName() === meshObj.GetName()) {
              continue;
            }
            childObj.AddChildren(meshObj);
            meshObj.SetParent(childObj);
          }
        }
      }

      onFinish(this.model);
    });

    this.worker.addEventListener ('error', (ev) => {
      console.log(ev);
    });

    this.worker.postMessage ({
      format : 'step',
      buffer : fileContent
    });
  }
}
