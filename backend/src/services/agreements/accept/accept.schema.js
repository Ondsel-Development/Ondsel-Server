// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../../validators.js'
import {agreementCategoryType} from "../agreements.schema.js";

// Main data model schema
export const acceptAgreementSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    category: agreementCategoryType,
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
    'category',
    'version'
  ], {
  $id: 'AcceptAgreementData'
})
export const acceptAgreementDataValidator = getValidator(acceptAgreementDataSchema, dataValidator)
export const acceptAgreementDataResolver = resolve({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
})

// Schema for updating existing entries
export const acceptAgreementPatchSchema = Type.Partial(acceptAgreementSchema, {
  $id: 'AcceptAgreementPatch'
})
export const acceptAgreementPatchValidator = getValidator(acceptAgreementPatchSchema, dataValidator)
export const acceptAgreementPatchResolver = resolve({})

// Schema for allowed query properties
export const acceptAgreementQueryProperties = Type.Pick(acceptAgreementSchema, ['_id', 'text'])
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
