export function readShapeAppearance(buffer) {
  const appearances = [];
  const entrySize = 24; // Each entry is 24 bytes long
  const numEntries = buffer.length / entrySize;

  for (let i = 0; i < numEntries; i++) {
    const entry = buffer.subarray(i * entrySize, (i + 1) * entrySize);

    if (entry.length === entrySize) {
      const dataView = new DataView(entry.buffer, entry.byteOffset, entry.byteLength);
      const ambientColor = dataView.getUint32(0, true);
      const diffuseColor = dataView.getUint32(4, true);
      const specularColor = dataView.getUint32(8, true);
      const emissiveColor = dataView.getUint32(12, true);
      const shininess = dataView.getFloat32(16, true);
      const transparency = dataView.getFloat32(20, true);

      const appearance = {
        ambientColor: ambientColor,
        diffuseColor: diffuseColor,
        specularColor: specularColor,
        emissiveColor: emissiveColor,
        shininess: shininess,
        transparency: transparency
      };
      appearances.push(appearance);
    }
  }
  return appearances;
}



export function intToRgba(colorInt) {
  const r = ((colorInt >> 24) & 0xFF) / 255;
  const g = ((colorInt >> 16) & 0xFF) / 255;
  const b = ((colorInt >> 8) & 0xFF) / 255;
  const a = (colorInt & 0xFF) / 255;
  return [r, g, b, a];
}
