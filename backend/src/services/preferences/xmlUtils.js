import xmlJs from 'xml-js';

// Function to get value by path
export function getValueByPath(obj, path, typesToSkip=null) {
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

  const getValue = item => (item.hasOwnProperty('_text') ? item._text : item._attributes.Value) || '';

  for (let key of Object.keys(currentNode)) {
    const values = currentNode[key];

    if (Array.isArray(values)) {
      for (let item of values) {
        if (item._attributes.Name === parts[parts.length-1]) {
          if (Array.isArray(typesToSkip) && typesToSkip.includes(key)) {
            continue;
          }
          return {key: path, type: key, value: getValue(item) };
        }
      }
    } else {
      if (values._attributes?.Name === parts[parts.length-1]) {
        if (Array.isArray(typesToSkip) && typesToSkip.includes(key)) {
          continue;
        }
        return { key: path, type: key, value: getValue(values) };
      }
    }

  }

  return null;
}


export function getLookupData (fileContent, lookupPaths, typesToSkip=null) {
  const data = [];
  const parsedXml = xmlJs.xml2js(fileContent, { compact: true });
  for (let path of lookupPaths) {
    const value = getValueByPath(parsedXml.FCParameters, path, typesToSkip);
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