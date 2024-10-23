import * as THREE from 'three';

import {ModelObject3D, ModelObjectType} from './object.js';

export class Model extends ModelObject3D
{
    constructor ()
    {
        super ();
        this.objects = [];
        this.propertyBagObject = null;
    }

    AddObject(object) {
        this.objects.push(object);
        return this.objects.length - 1;
    }

    RemoveObject(object) {
      this.objects = this.objects.filter(o => o.uuid !== object.uuid);
    }

    GetObjects() {
        return this.objects;
    }

    GetCompoundObject() {
        const object = new THREE.Group();
        for (let o of this.objects) {
          if (o.parent === null && (o.IsShapeType() || o.GetObject3d() instanceof THREE.Group) || o.type === ModelObjectType.Image) {
            object.add(o.GetObject3d());
          }
        }
        return object;
    }

    findObjectByMeshUuid(uuid) {
        for (let obj of this.objects) {
            if (obj.object3d.uuid === uuid) {
                return obj;
            }
        }
        return null;
    }

    GetRootObjects() {
      return this.objects.filter(o => o.parent === null);
    }

    GetObjectByName(name) {
      for (let obj of this.objects) {
        if (obj.name === name) {
          return obj;
        }
      }
      return null;
    }

  findObjectByUuid(uuid) {
    for (let obj of this.objects) {
      if (obj.uuid === uuid) {
        return obj;
      }
    }
    return null;
  }
}
