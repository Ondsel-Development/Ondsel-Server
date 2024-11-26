// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from 'lodash';
import { BadRequest } from '@feathersjs/errors';
import { getSource } from '../../hooks/userEngagements.js';


const validateLaunchShareLinkInOndselEsPayload = payload => {
  if (!payload.contextId) {
    throw new BadRequest(
      'The payload must contain a "contextId", which is the share link ID required to open in OndselES.'
    )
  }
}

export const createLaunchShareLinkInOndselEsEntry = context => {
  const { data, params } = context;

  validateLaunchShareLinkInOndselEsPayload(data);

  const version = _.get(params.headers, 'x-lens-version');

  context.data = {
    ..._.omit(data, ['shouldLaunchShareLinkInOndselEsEntry']),
    source: getSource(params),
    path: 'shared-models',
    method: 'get',
    connection: params.provider,
    event: 'LAUNCH_ONDSEL_ES',
    ...(version && {version: version}),
  };

  return context;
}
