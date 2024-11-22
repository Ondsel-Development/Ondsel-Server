// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as THREE from 'three';
import occtimportjs from 'occt-import-js';
import { OBJ_COLOR } from '@/threejs/libs/constants';
import { Model } from '@/threejs/libs/model/model';
import {ModelObject3D, ModelObjectType} from '@/threejs/libs/model/object';

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

    occtimportjs().then (occt => {
      const data = occt.ReadStepFile(fileContent, null);
      for (let resultMesh of data.meshes) {

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
        object3d.SetType(ModelObjectType.Shape);
        this.model.AddObject(object3d);
      }

      // Create Tree Structure

      for (let root of data.root.children) {
        let rootObj = this.model.GetObjectByName(root.name);
        if (!rootObj) {
          rootObj = new ModelObject3D();
          rootObj.SetType(ModelObjectType.Group);
          rootObj.SetName(root.name);
          rootObj.SetRealName(root.name);
          const rootObjGroup = new THREE.Group();
          rootObj.SetObject3d(rootObjGroup);
          this.model.AddObject(rootObj);
        }
        for (let child of root.children) {
          let childObj = this.model.GetObjectByName(child.name);
          if (!childObj) {
            childObj = new ModelObject3D();
            childObj.SetType(ModelObjectType.Group);
            const childObjGroup = new THREE.Group();
            childObj.SetName(child.name);
            childObj.SetRealName(child.name);
            childObj.SetObject3d(childObjGroup);
            this.model.AddObject(childObj);
          }
          rootObj.AddChildren(childObj);
          rootObj.GetObject3d().add(childObj.GetObject3d());
          childObj.SetParent(rootObj);
          for (let index in child.children) {
            const indexObj = this.model.GetObjects()[index];
            childObj.GetObject3d().add(indexObj.GetObject3d());
            childObj.AddChildren(indexObj);
            indexObj.SetParent(childObj);
          }

          for (let meshIndex of child.meshes) {
            const meshObj = this.model.GetObjects()[meshIndex]
            if (childObj.GetName() === meshObj.GetName()) {
              continue;
            }

            childObj.GetObject3d().add(meshObj.GetObject3d());
            childObj.AddChildren(meshObj);
            meshObj.SetParent(childObj);
          }
        }
      }
      onFinish(this.model);
    });

  }
}
