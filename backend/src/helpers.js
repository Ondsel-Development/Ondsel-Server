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

export const copyBeforePatch = async (context) => {
  // usable in any service in the context of a `patch`, this make a copy of the original object
  // and stores it in context.beforePatchCopy
  const service = context.service;
  const id = context.id;
  context.beforePatchCopy = await service.get(id);
  return context;
}

// the following was grabbed from https://gist.github.com/jasonrhodes/2321581
/**
 * A function to take a string written in dot notation style, and use it to
 * find a nested object property inside of an object.
 *
 * Useful in a plugin or module that accepts a JSON array of objects, but
 * you want to let the user specify where to find various bits of data
 * inside of each custom object instead of forcing a standardized
 * property list.
 *
 * @param String nested A dot notation style parameter reference (ie "urls.small")
 * @param Object object (optional) The object to search
 *
 * @return the value of the property in question
 */
export function getProperty( propertyName, object ) {
  let parts = propertyName.split( "." ),
    length = parts.length,
    i,
    property = object || this;

  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }

  return property;
}