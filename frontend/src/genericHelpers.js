export function getInitials(name) {
  const nameArray = name.split(' ');
  const firstName = nameArray[0].charAt(0).toUpperCase();
  const lastName = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
  if (nameArray.length === 1) {
    return firstName;
  }
  return firstName + lastName;
}
