// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ObjectIdSchema, Type } from '@feathersjs/typebox';
import _ from 'lodash';

import { userSummarySchema } from '../users/users.subdocs.schema.js';

export const messageSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    createdBy: ObjectIdSchema(),
    text: Type.String(),
  },
)
