import xmlJs from 'xml-js';

// Function to get value by path
export function getValueByPath(obj, path) {
  const parts = path.split('/');
  let currentNode = obj;

  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i];
    const foundNode = currentNode.FCParamGroup ?
      (Array.isArray(currentNode.FCParamGroup) ?
        currentNode.FCParamGroup.find(node => node._attributes.Name === part) :
        (currentNode.FCParamGroup._attributes.Name === part ? currentNode.FCParamGroup : null))
      : null;

    if (foundNode) {
      currentNode = foundNode;
    } else {
      return null;
    }
  }

  for (let key of Object.keys(currentNode)) {
    const values = currentNode[key];

    if (Array.isArray(values)) {
      for (let item of values) {
        if (item._attributes.Name === parts[parts.length-1]) {
          return {key: path, type: key, value: item.hasOwnProperty('_text') ? item._text : item._attributes.Value };
        }
      }
    } else {
      if (values._attributes?.Name === parts[parts.length-1]) {
        return {key: path, type: key, value: values.hasOwnProperty('_text') ? values._text : values._attributes.Value};
      }
    }

  }

  return null;
}


export function getLookupData (fileContent, lookupPaths) {
  const data = [];
  const parsedXml = xmlJs.xml2js(fileContent, { compact: true });
  for (let path of lookupPaths) {
    const value = getValueByPath(parsedXml.FCParameters, path);
    if (value) {
      data.push(value);
    }
  }
  return data;
}

// Test
/*
import xmlJs from 'xml-js';
import fs from 'fs';
const fileContent = fs.readFileSync("/home/ambu/.config/FreeCAD/system.cfg", "utf-8");

// Parse XML string
const parsedXml = xmlJs.xml2js(fileContent, { compact: true });

const path = "/Root/Modules/Spreadsheet/WorkBenchName";
const value = getValueByPath(parsedXml.FCParameters, path);
console.log(value);  // Output: Path/Help/index.html
*/