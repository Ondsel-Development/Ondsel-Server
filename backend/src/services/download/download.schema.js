// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema } from '../users/users.subdocs.schema.js';

// Main data model schema
export const downloadSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    fileKey: Type.String(),  // File name store in S3
    pin: Type.Optional(Type.String()),
    createdAt: Type.Number(),
    // Below fields user later to download Ondsel ES
    expireAt: Type.Optional(Type.Number()),
    user: Type.Optional(userSummarySchema),
  },
  { $id: 'Download', additionalProperties: false }
)
export const downloadValidator = getValidator(downloadSchema, dataValidator)
export const downloadResolver = resolve({})

export const downloadExternalResolver = resolve({})

// Schema for creating new entries
export const downloadDataSchema = Type.Pick(downloadSchema, ['fileKey', 'pin', 'expireAt'], {
  $id: 'DownloadData'
})
export const downloadDataValidator = getValidator(downloadDataSchema, dataValidator)
export const downloadDataResolver = resolve({
  createdAt: async () => Date.now(),
})

// Schema for updating existing entries
export const downloadPatchSchema = Type.Partial(downloadSchema, {
  $id: 'DownloadPatch'
})
export const downloadPatchValidator = getValidator(downloadPatchSchema, dataValidator)
export const downloadPatchResolver = resolve({})

// Schema for allowed query properties
export const downloadQueryProperties = Type.Pick(downloadSchema, ['_id', 'fileKey', 'pin', 'createdAt'])
export const downloadQuerySchema = Type.Intersect(
  [
    querySyntax(downloadQueryProperties),
    // Add additional query properties here
    Type.Object({
      pin: Type.Optional(Type.Union([Type.String(), Type.Object({ '$exists': Type.Boolean() })]))
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const downloadQueryValidator = getValidator(downloadQuerySchema, queryValidator)
export const downloadQueryResolver = resolve({})
