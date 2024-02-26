export class ModelObject3D
{
    constructor() {
        this.name = '';
        this.propertyGroups = [];
        this.meshes = [];
        this.object3d = null;
        this.color = null;
    }
    GetName ()
    {
        return this.name;
    }

    SetName (name)
    {
        this.name = name;
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

}
