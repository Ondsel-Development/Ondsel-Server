// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ObjectIdSchema, Type } from '@feathersjs/typebox';

export const groupSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String()
  }
)
