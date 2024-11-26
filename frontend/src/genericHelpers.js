// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

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

export function deriveOwnerDescAndRoute(user, org) {
  // if org isn't set, don't worry about assigning user
  if (!org) {
    return {
      desc: 'tbd',
      route: { name: 'LensHome' }
    }
  }
  if (org.type === 'Personal') {
    return {
      desc: `user ${user.name}`,
      route: { name: 'UserHome', params: { slug: user.username } },
    }
  } else {
    return {
      desc: `org ${org.name}`,
      route: { name: 'OrganizationHome', params: { slug: org.refName } },
    }
  }
}
