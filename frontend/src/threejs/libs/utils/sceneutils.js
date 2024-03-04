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
