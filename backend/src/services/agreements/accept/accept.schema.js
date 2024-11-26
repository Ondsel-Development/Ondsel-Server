// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../../validators.js'
import {agreementCategoryType} from "../agreements.subdocs.js";

// Main data model schema
export const acceptAgreementSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    createdAt: Type.Number(),
    category: agreementCategoryType,
    newAccount: Type.Boolean(), // when set, it actually does all the default categories, not jst the supplied one.
    version: Type.String(),
    dbResultMsg: Type.String(),
  },
  { $id: 'AcceptAgreement', additionalProperties: false }
)

export const acceptAgreementValidator = getValidator(acceptAgreementSchema, dataValidator)
export const acceptAgreementResolver = resolve({})

export const acceptAgreementExternalResolver = resolve({})

// Schema for creating new entries
export const acceptAgreementDataSchema = Type.Pick(acceptAgreementSchema, [
    'userId',
    'category',
    'version',
    'newAccount',
  ], {
  $id: 'AcceptAgreementData'
})
export const acceptAgreementDataValidator = getValidator(acceptAgreementDataSchema, dataValidator)
export const acceptAgreementDataResolver = resolve({
  createdAt: async () => Date.now(),
})

// Schema for updating existing entries
export const acceptAgreementPatchSchema = Type.Partial(acceptAgreementSchema, {
  $id: 'AcceptAgreementPatch'
})
export const acceptAgreementPatchValidator = getValidator(acceptAgreementPatchSchema, dataValidator)
export const acceptAgreementPatchResolver = resolve({})

// Schema for allowed query properties
export const acceptAgreementQueryProperties = Type.Pick(acceptAgreementSchema, ['_id'])
export const acceptAgreementQuerySchema = Type.Intersect(
  [
    querySyntax(acceptAgreementQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const acceptAgreementQueryValidator = getValidator(acceptAgreementQuerySchema, queryValidator)
export const acceptAgreementQueryResolver = resolve({})
