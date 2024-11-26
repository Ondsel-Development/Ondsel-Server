// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { BadRequest } from '@feathersjs/errors';

export const checkoutToVersion = async context => {
  if (!context.data.versionId) {
    throw new BadRequest('You need to mention `versionId` in order to checkout.')
  }
  const { versions } = await context.service.get(context.id);
  if (!versions.some(version => version._id.toString() === context.data.versionId)){
    throw new BadRequest('Given versionId not exist, pass valid versionId')
  }

  context.data = {
    currentVersionId: context.data.versionId,
  }
  return context;
}