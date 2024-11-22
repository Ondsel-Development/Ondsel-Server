// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as THREE from 'three';

export function getObject3dFromScene(scene, object3d) {
  let obj = null;
  scene.traverse(function (object) {
    if (object instanceof THREE.Mesh) {
      if (object.parent.uuid === object3d.object3d.uuid) {
        obj = object;
      }
    }
  });
  return obj;
}
