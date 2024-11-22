// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Type, getValidator, defaultAppConfiguration } from '@feathersjs/typebox'

import { dataValidator } from './validators.js'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String()
  })
])

export const configurationValidator = getValidator(configurationSchema, dataValidator)
