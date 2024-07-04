export function getInitials(name) {
  const nameArray = name.split(' ');
  const firstName = nameArray[0].charAt(0).toUpperCase();
  const lastName = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
  if (nameArray.length === 1) {
    return firstName;
  }
  return firstName + lastName;
}

export function cleanupString(src, len) {
  // this function returns a string
  // * without trailing and leading spaces
  // * truncated to at-least N characters
  const firstTrim = src ? src.trim() : '';
  const shortDirty = firstTrim.substring(0, len); // this might leave a trailing space again
  const shortTrimmed = shortDirty.trim();
  return shortTrimmed;
}
