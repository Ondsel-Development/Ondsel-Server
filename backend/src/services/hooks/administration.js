// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {BadRequest, NotAuthenticated} from "@feathersjs/errors";
import {OrganizationTypeMap} from "../organizations/organizations.subdocs.schema.js";

export const verifyOndselAdministrativePower = async context => {
  let reason = 'External and account does not have permissions for administration';
  if (context.params.provider === undefined){ // Internal calls are "undefined"
    return context;
  }
  const user = context.params.user;
  const orgList = user.organizations;
  if (orgList) {
    const adminOrg = orgList.find(org => org.type === OrganizationTypeMap.ondsel);
    if (adminOrg) {
      // second check against real org entry
      const realOrg = await context.app.service('organizations').get(adminOrg._id);
      if (realOrg) {
        if (realOrg.type === OrganizationTypeMap.ondsel) {
          const userList = realOrg.users
          const matchIndex = userList.findIndex(orgUser => orgUser._id.equals(user._id));
          if (matchIndex !== -1) {
            if (userList[matchIndex].isAdmin === true) {
              return context;
            } else {
              reason = 'Not an Ondsel admin.'
            }
          }
        }
      }
    } else {
      reason = 'Not an Ondsel employee.'
    }
  }
  throw new NotAuthenticated(reason);
}

// export const isEndUser = async (context) => {
//   const provider = context.params.provider; // Internal calls are "undefined"
//   if (provider === undefined) {
//     return false;
//   }
//   if (isAdminUser(context.params?.user)) {
//     return false;
//   } else {
//     return true;
//   }
// }
//
// export const isAdminUser = (user) => {
//   let email = user?.email;
//   let flag = user?.isTripe;
//   if (flag === true && email.includes("@ondsel.com")) {
//     return true;
//   }
//   return false;
// }