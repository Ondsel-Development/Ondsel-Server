// generic helpers


export function mapHasValue(mapObj, value) {
  // do not use this on complex inheritance objects; meant for simple maps
  for(const id in mapObj) {
    if(mapObj[id] === value) {
      return true;
    }
  }
  return false;
}

export function mapMissingValue(mapObj, value) {
  // do not use this on complex inheritance objects; meant for simple maps
  return !mapHasValue(mapObj, value)
}
