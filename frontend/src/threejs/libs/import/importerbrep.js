// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as THREE from 'three';
import { OBJ_COLOR } from '@/threejs/libs/constants';
import { Model } from '@/threejs/libs/model/model';
import {ModelObject3D, ModelObjectType} from '@/threejs/libs/model/object';

export class ImporterBrep {

  constructor() {
    this.model = new Model ();
    this.file = null;
    this.worker = null;
    this.objects = [];
  }

  CanImportExtension(extension) {
    return extension.toUpperCase() === 'BREP' || extension.toUpperCase() === 'BRP';
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
      let object3d = new ModelObject3D ();
      object3d.SetType(ModelObjectType.Shape);
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
      }

      object3d.SetObject3d(mainObject);
      this.model.AddObject(object3d);
      onFinish(this.model);
    });

    this.worker.addEventListener ('error', (ev) => {
      console.log(ev);
    });

    this.worker.postMessage ({
      format : 'brep',
      buffer : fileContent
    });
  }
}
