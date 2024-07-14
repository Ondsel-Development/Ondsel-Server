// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {fileVersionProductionQuoteSchema, sharedModelProductionQuoteSchema} from "./org-orders.subdocs.schema.js";

// Main data model schema
export const orgOrdersSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    organizationId: ObjectIdSchema(),
    productionQuotes: Type.Array(Type.Union([
      fileVersionProductionQuoteSchema,
      sharedModelProductionQuoteSchema,
    ])),
  },
  { $id: 'OrgOrders', additionalProperties: false }
)
export const orgOrdersValidator = getValidator(orgOrdersSchema, dataValidator)
export const orgOrdersResolver = resolve({})

export const orgOrdersExternalResolver = resolve({})

// Schema for creating new entries
export const orgOrdersDataSchema = Type.Pick(orgOrdersSchema, ['text'], {
  $id: 'OrgOrdersData'
})
export const orgOrdersDataValidator = getValidator(orgOrdersDataSchema, dataValidator)
export const orgOrdersDataResolver = resolve({})

// Schema for updating existing entries
export const orgOrdersPatchSchema = Type.Partial(orgOrdersSchema, {
  $id: 'OrgOrdersPatch'
})
export const orgOrdersPatchValidator = getValidator(orgOrdersPatchSchema, dataValidator)
export const orgOrdersPatchResolver = resolve({})

// Schema for allowed query properties
export const orgOrdersQueryProperties = Type.Pick(orgOrdersSchema, ['_id', 'text'])
export const orgOrdersQuerySchema = Type.Intersect(
  [
    querySyntax(orgOrdersQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const orgOrdersQueryValidator = getValidator(orgOrdersQuerySchema, queryValidator)
export const orgOrdersQueryResolver = resolve({})
