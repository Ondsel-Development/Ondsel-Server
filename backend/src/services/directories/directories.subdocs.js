// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

export const directorySummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
  }
)
