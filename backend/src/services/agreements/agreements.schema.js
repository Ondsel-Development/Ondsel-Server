// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import {Type, getValidator, querySyntax, StringEnum} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {agreementCategoryType, specificAgreementType} from "./agreements.subdocs.js";

// Main data model schema
export const agreementsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    category: agreementCategoryType,
    current: specificAgreementType,
    history: Type.Array(specificAgreementType),
  },
  { $id: 'Agreements', additionalProperties: false }
)
export const agreementsValidator = getValidator(agreementsSchema, dataValidator)
export const agreementsResolver = resolve({})

export const agreementsExternalResolver = resolve({})

// Schema for creating new entries
export const agreementsDataSchema = Type.Pick(agreementsSchema, [
  'category',
  'current',
  'history',
], {
  $id: 'AgreementsData'
})
export const agreementsDataValidator = getValidator(agreementsDataSchema, dataValidator)
export const agreementsDataResolver = resolve({})

// Schema for updating existing entries
export const agreementsPatchSchema = Type.Partial(agreementsSchema, {
  $id: 'AgreementsPatch'
})
export const agreementsPatchValidator = getValidator(agreementsPatchSchema, dataValidator)
export const agreementsPatchResolver = resolve({})

// Schema for allowed query properties
export const agreementsQueryProperties = Type.Pick(agreementsSchema, ['_id', 'category'])
export const agreementsQuerySchema = Type.Intersect(
  [
    querySyntax(agreementsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const agreementsQueryValidator = getValidator(agreementsQuerySchema, queryValidator)
export const agreementsQueryResolver = resolve({})
