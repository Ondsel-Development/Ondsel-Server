import * as THREE from 'three';

export function fitCameraToSelection(camera, controls, selection, obj, fitOffset = 1.2) {
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  const box = new THREE.Box3();

  if (selection) {
    box.makeEmpty();
    for(const object of selection) {
      box.expandByObject(object);
    }
  } else {
    box.setFromObject(obj);
  }

  box.getSize(size);
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = controls.target.clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  controls.maxDistance = distance * 10;
  controls.target.copy(center);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(controls.target).sub(direction);

  controls.update();
}
