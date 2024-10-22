import * as THREE from 'three';
import {v4 as uuidv4} from 'uuid';
import { OBJ_COLOR } from '@/threejs/libs/constants';

export const ModelObjectType = Object.freeze({
  Shape: 'Shape',
  Link: 'Link',
  Assembly: 'Assembly',
  Group: 'Group',
  Image: 'Image'
})

export class ModelObject3D
{
    constructor() {
        this.uuid = uuidv4();
        this.realName = '';
        this.name = '';
        this.propertyGroups = [];
        this.meshes = [];
        this.object3d = null;
        this.color = null;
        this.parent = null;
        this.children = [];
        this.visibility = null;
        this.type = null;
    }
    GetName ()
    {
        return this.name;
    }

    SetName (name)
    {
        this.name = name;
    }

    GetRealName ()
    {
        return this.realName;
    }

    SetRealName (name)
    {
        this.realName = name;
    }

    GetLabel() {
      if (this.name) {
        return this.name;
      }
      return `Compound_${this.uuid.substring(0, 8)}`;
     }

    GetObject3d ()
    {
        return this.object3d;
    }

    SetObject3d (object3d)
    {
        this.object3d = object3d;
    }

    PropertyGroupCount ()
    {
        return this.propertyGroups.length;
    }

    AddPropertyGroup (propertyGroup)
    {
        this.propertyGroups.push (propertyGroup);
        return this.propertyGroups.length - 1;
    }

    GetPropertyGroup (index)
    {
        return this.propertyGroups[index];
    }

    CloneProperties (target)
    {
        for (let propertyGroup of this.propertyGroups) {
            target.AddPropertyGroup (propertyGroup.Clone ());
        }
    }

    AddMesh (mesh)
    {
        this.meshes.push (mesh);
        return this.meshes.length - 1;
    }

    AddMeshes (meshes) {
        this.meshes.push(...meshes);
        return this.meshes.length - 1;
    }
    GetMeshes() {
        return this.meshes;
    }

    SetColor(color) {
        this.color = color;
        return this.color;
    }

    GetColor() {
        if (this.color) {
            return this.color;
        }
        return new THREE.Color(OBJ_COLOR);
    }

    SetParent(modelObject) {
      this.parent = modelObject;
      return this.parent;
    }

    GetParent() {
      return this.parent;
    }

    AddChildren(mainObject) {
      this.children.push(mainObject);
      return this.children.length - 1;
    }

    GetChildren() {
      return this.children;
    }

    GetType() {
      return this.type;
    }

    SetType (type)
    {
      this.type = type;
    }

    IsAssemblyType() {
      return this.type === ModelObjectType.Assembly;
    }

    IsShapeType() {
      return this.GetType() === ModelObjectType.Shape;
    }

    GetVisibility() {
      if (this.IsShapeType() || this.type === ModelObjectType.Image) {
        return this.object3d.visible;
      }
      if (this.visibility === null) {
        this.visibility = true;
      }
      return this.visibility;
    }

    ToggleVisibility(isVisible = null) {
      if (this.IsShapeType() || this.type === ModelObjectType.Image) {
        if (isVisible === null) {
          this.object3d.visible = !this.GetVisibility();
        } else {
          this.object3d.visible = isVisible;
        }
      } else {
        this.visibility = !this.GetVisibility();
        this.GetAllChildren().forEach(object => object.ToggleVisibility(this.visibility));
      }
    }

  GetAllChildren() {
    let allChildren = [];

    function collectChildren(object) {
      object.children.forEach(child => {
        allChildren.push(child);
        collectChildren(child); // Recursively collect children of the current child
      });
    }

    collectChildren(this);
    return allChildren;
  }

}
