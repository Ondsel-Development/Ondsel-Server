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

