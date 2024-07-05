import * as THREE from 'three';
import { Model } from '../model/model.js';
import { ModelObject3D } from '../model/object.js';
import { GetFileExtension } from '../utils/fileutils.js';
import { ArrayBufferToUtf8String } from '../utils/bufferutils.js';
import { Property, PropertyGroup, PropertyType } from '../model/property.js';
import { readShapeAppearance, intToRgba } from './utils.js';

import * as fflate from 'fflate';
import { OBJ_COLOR } from '@/threejs/libs/constants';

const DocumentInitResult =
  {
      Success : 0,
      NoDocumentXml : 1
  };


class FreeCadObject
{
    constructor (name, type)
    {
        this.name = name;
        this.type = type;
        this.shapeName = null;
        this.isVisible = false;
        this.color = null;
        this.fileName = null;
        this.fileContent = null;
        this.inLinkCount = 0;
        this.properties = null;
    }

    IsConvertible ()
    {
        if (this.fileName === null || this.fileContent === null) {
            return false;
        }
        if (!this.isVisible) {
            return false;
        }
        if (this.inLinkCount > 0) {
            return false;
        }
        return true;
    }

    GetColor() {
      if (this.color) {
        return this.color;
      }

      return new THREE.Color(OBJ_COLOR);

    }
}

class FreeCadDocument
{
    constructor ()
    {
        this.files = null;
        this.properties = null;
        this.objectNames = [];
        this.objectData = new Map ();
        this.documentXml = null;
    }

    Init (fileContent)
    {
        let fileContentBuffer = new Uint8Array (fileContent);
        this.files = fflate.unzipSync (fileContentBuffer);
        if (!this.LoadDocumentXml ()) {
            return DocumentInitResult.NoDocumentXml;
        }

        this.LoadGuiDocumentXml ();
        return DocumentInitResult.Success;

    }

    GetObjectListToConvert ()
    {
        let objectList = [];
        for (let objectName of this.objectNames) {
            let object = this.objectData.get (objectName);
            if (!object.IsConvertible ()) {
                continue;
            }
            objectList.push (object);
        }
        return objectList;
    }

    IsSupportedType (type, name)
    {
        if (name === 'PropertyBag') {
            return true;
        }
        if (!type.startsWith ('Part::') && !type.startsWith ('PartDesign::')) {
            return false;
        }
        if (type.indexOf ('Part2D') !== -1) {
            return false;
        }
        return true;
    }

    HasFile (fileName)
    {
        return (fileName in this.files);
    }

    LinkedFiles() {
      if (this.documentXml === null) {
        return false;
      }

      let linkedFiles = {};
      let linkedObjectsName = [];

      let objectsElements = this.documentXml.getElementsByTagName('Objects');
      for (let objectsElement of objectsElements) {
        let objectElements = objectsElement.getElementsByTagName('Object');
        for (let objectElement of objectElements) {
          let name = objectElement.getAttribute('name');
          let type = objectElement.getAttribute('type');
          if (type === 'App::Link') {
            linkedObjectsName.push(name)
          }
        }
      }

      let objectDataElements = this.documentXml.getElementsByTagName('ObjectData');
      for (let objectsElement of objectDataElements) {
        let objectElements = objectsElement.getElementsByTagName('Object');
        for (let objectElement of objectElements) {
          let objectName = objectElement.getAttribute('name');
          if (!linkedObjectsName.includes(objectName)) {
            continue;
          }
          let properties = objectElement.getElementsByTagName('Property');
          for (let propertyElement of properties) {
            let name = propertyElement.getAttribute('name');
            if (name === 'LinkedObject') {
              let xLinkElement = propertyElement.getElementsByTagName('XLink')[0];
              let fileName = xLinkElement.getAttribute('file');
              linkedFiles[objectName] = fileName;
            }
          }
        }
      }
      return linkedFiles;
    }

    LoadDocumentXml ()
    {
        const excludedObjects = ['App::Plane', 'App::Origin'];
        let documentXml = this.GetXMLContent ('Document.xml');
        if (documentXml === null) {
            return false;
        }
        this.documentXml = documentXml;

        this.properties = new PropertyGroup ('Properties');
        let documentElements = documentXml.getElementsByTagName ('Document');
        for (let documentElement of documentElements) {
            for (let childNode of documentElement.childNodes) {
                if (childNode.tagName === 'Properties') {
                    this.GetPropertiesFromElement (childNode, this.properties);
                }
            }
        }

        let objectsElements = documentXml.getElementsByTagName ('Objects');
        for (let objectsElement of objectsElements) {
            let objectElements = objectsElement.getElementsByTagName ('Object');
            for (let objectElement of objectElements) {
                let name = objectElement.getAttribute ('name');
                let type = objectElement.getAttribute ('type');
                let fileName = `ondsel_${name}.brp`
                // Hack for ObjectList view to avoid showing Origin and Plane object. For new files we already fixed on
                // FC_Worker side, this is for already generated files.
                if (excludedObjects.includes(type)) {
                  continue
                }
                if (!(this.IsSupportedType (type, name) || this.HasFile(fileName))) {
                    continue;
                }
                let object = new FreeCadObject (name, type);
                this.objectNames.push (name);
                this.objectData.set (name, object);
            }
        }

        let objectDataElements = documentXml.getElementsByTagName ('ObjectData');
        for (let objectDataElement of objectDataElements) {
            let objectElements = objectDataElement.getElementsByTagName ('Object');
            for (let objectElement of objectElements) {
                let name = objectElement.getAttribute ('name');
                if (!this.objectData.has (name)) {
                    continue;
                }

                let object = this.objectData.get (name);
                object.properties = new PropertyGroup ('Properties');
                for (let childNode of objectElement.childNodes) {
                    if (childNode.tagName === 'Properties') {
                        this.GetPropertiesFromElement (childNode, object.properties);
                    }
                }

                let propertyElements = objectElement.getElementsByTagName ('Property');
                let hasShapePrp = false;
                for (let propertyElement of propertyElements) {
                    let propertyName = propertyElement.getAttribute ('name');
                    if (propertyName === 'Label') {
                        object.shapeName = this.GetFirstChildValue (propertyElement, 'String', 'value');
                    } else if (propertyName === 'Visibility') {
                        let isVisibleString = this.GetFirstChildValue (propertyElement, 'Bool', 'value');
                        object.isVisible = (isVisibleString === 'true');
                    } else if (propertyName === 'Visible') {
                        let isVisibleString = this.GetFirstChildValue (propertyElement, 'Bool', 'value');
                        object.isVisible = (isVisibleString === 'true');
                    } else if (propertyName === 'Shape') {
                        let fileName = this.GetFirstChildValue (propertyElement, 'Part', 'file');
                        if (!this.HasFile (fileName)) {
                            continue;
                        }
                        let extension = GetFileExtension (fileName);
                        if (extension !== 'brp' && extension !== 'brep') {
                            continue;
                        }
                        object.fileName = fileName;
                        object.fileContent = this.files[fileName];
                        hasShapePrp = true;
                    }
                }

                if (!hasShapePrp) {
                  let fileName = `ondsel_${name}.brp`
                  if (!this.HasFile (fileName)) {
                      continue;
                  }
                  let extension = GetFileExtension (fileName);
                  if (extension !== 'brp' && extension !== 'brep') {
                      continue;
                  }
                  object.fileName = fileName;
                  object.fileContent = this.files[fileName];
                }

                let linkElements = objectElement.getElementsByTagName ('Link');
                for (let linkElement of linkElements) {
                    let linkedName = linkElement.getAttribute ('value');
                    if (this.objectData.has (linkedName)) {
                        let linkedObject = this.objectData.get (linkedName);
                        linkedObject.inLinkCount += 1;
                    }
                }
            }
        }

        return true;
    }

    LoadGuiDocumentXml ()
    {
        let documentXml = this.GetXMLContent ('GuiDocument.xml');
        if (documentXml === null) {
            return false;
        }

        let viewProviderElements = documentXml.getElementsByTagName ('ViewProvider');
        for (let viewProviderElement of viewProviderElements) {
            let name = viewProviderElement.getAttribute ('name');
            if (!this.objectData.has (name)) {
                continue;
            }

            let object = this.objectData.get (name);
            let propertyElements = viewProviderElement.getElementsByTagName ('Property');
            for (let propertyElement of propertyElements) {
                let propertyName = propertyElement.getAttribute ('name');
                if (propertyName === 'Visibility') {
                    let isVisibleString = this.GetFirstChildValue (propertyElement, 'Bool', 'value');
                    object.isVisible = (isVisibleString === 'true');
                } else if (propertyName === 'ShapeColor') {
                    /*
                    <Property name="ShapeColor" type="App::PropertyColor" status="1">
                        <PropertyColor value="1073807104"/>
                    </Property>
                     */
                    let colorString = this.GetFirstChildValue (propertyElement, 'PropertyColor', 'value');
                    let colorInt = parseInt (colorString, 10);
                    object.color = new THREE.Color(...intToRgba(colorInt))
                } else if (propertyName === 'ShapeAppearance') {
                    /*
                    <Property name="ShapeAppearance" type="App::PropertyMaterialList" status="9">
                        <MaterialList file="ShapeAppearance" version="3"/>
                    </Property>
                     */
                    let file = this.GetFirstChildValue (propertyElement, 'MaterialList', 'file');
                    const shapeAppearanceBuffer = this.files[file];
                    const materialList = readShapeAppearance(shapeAppearanceBuffer);
                    if (materialList.length) {
                        object.color = new THREE.Color(...intToRgba(materialList[0].specularColor))
                    }
                } else if (propertyName === 'ShapeMaterial') {
                    /*
                    <Property name="ShapeMaterial" type="App::PropertyMaterial" status="1">
                        <PropertyMaterial ambientColor="858993408" diffuseColor="1073807104" specularColor="0" emissiveColor="0" shininess="0.2000000029802322" transparency="0.0000000000000000"/>
                    </Property>
                     */
                    let colorString = this.GetFirstChildValue (propertyElement, 'PropertyMaterial', 'diffuseColor');
                    const colorInt = parseInt (colorString, 10);
                    object.color = new THREE.Color(colorInt);
                }
            }
        }

        return true;
    }

    GetPropertiesFromElement (propertiesElement, propertyGroup)
    {
        let propertyElements = propertiesElement.getElementsByTagName ('Property');
        for (let propertyElement of propertyElements) {
            let propertyName = propertyElement.getAttribute ('name');
            let propertyType = propertyElement.getAttribute ('type');

            let property = null;
            if (propertyType === 'App::PropertyBool') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'String', 'bool');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Boolean, propertyName, propertyValue === 'true');
                }
            } else if (propertyType === 'App::PropertyAngle') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Float', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Angle, propertyName, parseInt (propertyValue));
                }
            } else if (propertyType === 'App::PropertyInteger') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Integer', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Integer, propertyName, parseInt (propertyValue));
                }
            } else if (propertyType === 'App::PropertyString') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'String', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Text, propertyName, propertyValue);
                }
            } else if (propertyType === 'App::PropertyUUID') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Uuid', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Text, propertyName, propertyValue);
                }
            } else if (propertyType === 'App::PropertyFloat' || propertyType === 'App::PropertyLength' || propertyType === 'App::PropertyDistance' || propertyType === 'App::PropertyArea' || propertyType === 'App::PropertyVolume') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Float', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Number, propertyName, parseFloat (propertyValue));
                }
            }
            if (property !== null) {
                propertyGroup.AddProperty (property);
            }
        }
    }

    GetXMLContent (xmlFileName)
    {
        if (!this.HasFile (xmlFileName)) {
            return null;
        }

        let xmlParser = new DOMParser ();
        let xmlString = ArrayBufferToUtf8String (this.files[xmlFileName]);
        return xmlParser.parseFromString (xmlString, 'text/xml');
    }

    GetFirstChildValue (element, childTagName, childAttribute)
    {
        let childObjects = element.getElementsByTagName (childTagName);
        if (childObjects.length === 0) {
            return null;
        }
        return childObjects[0].getAttribute (childAttribute);
    }

    GetPropertyBagObject() {
        for (let [key, value] of this.objectData) {
            if (key === 'PropertyBag') return value
        }
        return null;
    }
}

export class ImporterFcstd
{
    constructor ()
    {
        this.model = new Model ();
        this.worker = null;
        this.document = null;
        this.objects = [];
    }

    SetError(error) {
        console.log(error);
    }

    CanImportExtension (extension)
    {
        return extension.toUpperCase() === 'FCSTD';
    }

    GetUpDirection ()
    {
        // return Direction.Z;
    }

    ClearContent ()
    {
        if (this.worker !== null) {
            this.worker.terminate ();
            this.worker = null;
        }
        this.document = null;
    }

    ResetContent ()
    {
        this.model = new Model ();
        this.objects = [];
        this.worker = null;
        this.document = new FreeCadDocument ();
    }

    LoadFile(fileUrl, callback) {
        this.file = fileUrl;
        this.ResetContent();
        fetch(fileUrl).then(async response => {
            let buffer = await response.arrayBuffer ();
            let fileBuffer = new Uint8Array (buffer);
            this.ImportContent(fileBuffer, callback);
        });
    }

    ImportContent (fileContent, onFinish)
    {
        let result = this.document.Init (fileContent);
        if (result === DocumentInitResult.NoDocumentXml) {
            this.SetError ('No Document.xml found.');
            onFinish ();
            return;
        }

        if (this.document.properties !== null && this.document.properties.PropertyCount () > 0) {
            this.model.AddPropertyGroup (this.document.properties);
        }

        let objectsToConvert = this.document.GetObjectListToConvert ();
        if (objectsToConvert.length === 0) {
            this.SetError ('No importable object found.');
            onFinish (this.model);
            return;
        }

        this.model.propertyBagObject = this.document.GetPropertyBagObject();
        this.ConvertObjects (objectsToConvert, onFinish);
    }

    ConvertObjects (objects, onFinish)
    {
        this.worker = new Worker('/occt-import-js/dist/occt-import-js-worker.js');

        let convertedObjectCount = 0;
        let colorToMaterial = null;
        let onFileConverted = (resultContent) => {
            if (resultContent !== null) {
                let currentObject = objects[convertedObjectCount];
                this.OnFileConverted (currentObject, resultContent, colorToMaterial);
            }
            convertedObjectCount += 1;
            if (convertedObjectCount === objects.length) {
                onFinish (this.model);
            } else {
                let currentObject = objects[convertedObjectCount];
                this.worker.postMessage ({
                    format : 'brep',
                    buffer : currentObject.fileContent
                });
            }
        };

        this.worker.addEventListener ('message', (ev) => {
            onFileConverted (ev.data);
        });

        this.worker.addEventListener ('error', (ev) => {
            onFileConverted (null);
        });

        let currentObject = objects[convertedObjectCount];
        this.worker.postMessage ({
            format : 'brep',
            buffer : currentObject.fileContent
        });
    }

    OnFileConverted (object, resultContent, colorToMaterial)
    {
        if (!resultContent.success || resultContent.meshes.length === 0) {
            return;
        }

        let object3d = new ModelObject3D ();
        if (object.shapeName !== null) {
            object3d.SetName (object.shapeName);
        }

        if (object.name !== null) {
            object3d.SetRealName (object.name);
        }

        if (object.properties !== null && object.properties.PropertyCount () > 0) {
            object3d.AddPropertyGroup (object.properties);
        }

        if (object.color !== null) {
            object3d.SetColor(object.color);
        }

        // object3d.AddMeshes(resultContent.meshes);

        let mainObject = new THREE.Object3D();
        for (let resultMesh of resultContent.meshes) {
            let geometry = new THREE.BufferGeometry();

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3));
            if (resultMesh.attributes.normal) {
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3));
            }
            const index = Uint32Array.from(resultMesh.index.array);
            geometry.setIndex(new THREE.BufferAttribute(index, 1));

            let material = new THREE.MeshPhongMaterial({color: object.GetColor()})
            const mesh = new THREE.Mesh (geometry, material);
            mainObject.add(mesh);
        }
        object3d.SetObject3d(mainObject);

        this.model.AddObject(object3d);

    }
}
