// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {stripeEventsDataSchema, stripeEventsProcessedSchema} from "./stripe-events.subdocs.schema.js";


// Main data model schema
export const stripeEventsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),         // mongodb id
    id: Type.String(),             // stripe id
    object: Type.String(),         // "event"
    api_version: Type.String(),    // "2019-02-19" or similar
    created: Type.Integer(),       // this is unix timestamp int
    data: stripeEventsDataSchema,
    processed: stripeEventsProcessedSchema,
  },
  { $id: 'StripeEvents', additionalProperties: false }
)
export const stripeEventsValidator = getValidator(stripeEventsSchema, dataValidator)
export const stripeEventsResolver = resolve({})

export const stripeEventsExternalResolver = resolve({})

// Schema for creating new entries
export const stripeEventsDataSchema = Type.Pick(stripeEventsSchema, [
  // pretty much everything except `processed` and `_id`
  'id',
  'object',
  'api_version',
  'created',
  'data',
], {
  $id: 'StripeEventsData'
})
export const stripeEventsDataValidator = getValidator(stripeEventsDataSchema, dataValidator)
export const stripeEventsDataResolver = resolve({})

// Schema for updating existing entries
export const stripeEventsPatchSchema = Type.Partial(stripeEventsSchema, {
  $id: 'StripeEventsPatch'
})
export const stripeEventsPatchValidator = getValidator(stripeEventsPatchSchema, dataValidator)
export const stripeEventsPatchResolver = resolve({})

// Schema for allowed query properties
export const stripeEventsQueryProperties = Type.Pick(stripeEventsSchema, ['_id', 'text'])
export const stripeEventsQuerySchema = Type.Intersect(
  [
    querySyntax(stripeEventsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const stripeEventsQueryValidator = getValidator(stripeEventsQuerySchema, queryValidator)
export const stripeEventsQueryResolver = resolve({})
