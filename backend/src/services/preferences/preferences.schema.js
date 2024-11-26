// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import {resolve, virtual} from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { organizationSummarySchema } from '../organizations/organizations.subdocs.schema.js';
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { preferenceVersionSchema } from './preferences.subdocs.js';


export const ondselPrefId = '000000000000000000000000';

// Main data model schema
export const preferencesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    createdBy: userSummarySchema,
    organization: organizationSummarySchema,
    versions: Type.Array(preferenceVersionSchema),
    currentVersionId: ObjectIdSchema(),
  },
  { $id: 'Preferences', additionalProperties: false }
)
export const preferencesValidator = getValidator(preferencesSchema, dataValidator)
export const preferencesResolver = resolve({
  currentVersion: virtual(async(message, _context) => {
    if (message.versions && message.currentVersionId ) {
      return message.versions.find(version => version._id.equals(message.currentVersionId) )
    }
  })
})

export const preferencesExternalResolver = resolve({})

// Schema for creating new entries
export const preferencesDataSchema = Type.Pick(preferencesSchema, ['organization', 'versions', 'currentVersionId'], {
  $id: 'PreferencesData'
})
export const preferencesDataValidator = getValidator(preferencesDataSchema, dataValidator)
export const preferencesDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
})

// Schema for updating existing entries
export const preferencesPatchSchema = Type.Partial(preferencesSchema, {
  $id: 'PreferencesPatch'
})
export const preferencesPatchValidator = getValidator(preferencesPatchSchema, dataValidator)
export const preferencesPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const preferencesQueryProperties = Type.Pick(preferencesSchema, ['_id'])
export const preferencesQuerySchema = Type.Intersect(
  [
    querySyntax(preferencesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const preferencesQueryValidator = getValidator(preferencesQuerySchema, queryValidator)
export const preferencesQueryResolver = resolve({})
