import * as THREE from 'three';

import { ModelObject3D } from './object.js';

export class Model extends ModelObject3D
{
    constructor ()
    {
        super ();
        this.objects = [];
    }

    AddObject(object) {
        this.objects.push(object);
        return this.objects.length - 1;
    }

    GetObjects() {
        return this.objects;
    }

    GetCompoundObject() {
        const object = new THREE.Group();
        for (let o of this.objects) {
            object.add(o.GetObject3d());
        }
        return object;
    }
}
