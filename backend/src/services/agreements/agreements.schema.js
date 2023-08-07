// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import {Type, getValidator, querySyntax, StringEnum} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

export const agreementCategoryTypeMap = {
  privacyPolicy: 'privacy-policy',
  termsOfService: 'terms-of-service'
}
export const agreementCategoryType = StringEnum([
  agreementCategoryTypeMap.privacyPolicy,
  agreementCategoryTypeMap.termsOfService,
])

export const specificAgreementType = Type.Object(
  {
    agreementDocId: ObjectIdSchema(),
    title: Type.String(),
    effective: Type.Number(), // a formal date
    deprecated: Type.Union([Type.Number(), Type.Null()]), // null means not deprecated yet
    version: Type.String(),
    markdownContent: Type.String(),
    docPostedAt: Type.Number(), // when this was uploaded to db
  }
)

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
export const agreementsDataSchema = Type.Pick(agreementsSchema, ['text'], {
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
