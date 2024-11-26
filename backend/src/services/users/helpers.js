// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const handleQueryArgs = () => {
  return async (context, next) => {
    // this is an "around" hook
    if (context.params?.query?.getOnlyAccessTokenUser) {
      context.$getOnlyAccessTokenUser = context.params.query.getOnlyAccessTokenUser === 'true';
      delete context.params.query.getOnlyAccessTokenUser;
    }
    await next();
    return context;
  }
}
