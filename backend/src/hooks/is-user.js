// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const isEndUser = async (context) => {
  const provider = context.params.provider; // Internal calls are "undefined"
  if (provider === undefined) {
    return false;
  }
  if (isAdminUser(context.params?.user)) {
    return false;
  } else {
    return true;
  }
}

export const isAdminUser = (user) => {
  // to be deprecated as .isTripe is to be deprecated; use verifyOndselAdministrativePower instead
  let email = user?.email;
  let flag = user?.isTripe;
  if (flag === true && email.includes("@ondsel.com")) {
    return true;
  }
  return false;
}

