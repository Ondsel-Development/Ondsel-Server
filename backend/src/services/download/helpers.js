// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import _ from 'lodash';
import { ObjectId } from 'mongodb';

export const generatePin = async context => {
  if (_.get(context, 'data.shouldGeneratePin')) {
    context.data.pin = new ObjectId().toString();
    context.data = _.omit(context.data, ['shouldGeneratePin']);
  }
  return context;
}
