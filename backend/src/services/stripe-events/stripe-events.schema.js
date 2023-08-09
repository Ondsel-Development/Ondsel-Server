// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { stripeEventsRequest } from "./stripe-events.subdocs.js";

// Main data model schema
export const stripeEventsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    processed: Type.Boolean(),
    whenProcessed: Type.Optional(Type.Number()),
    whenWebHookCalled: Type.Number(),
    id: Type.String({$id: "stripeId", default: "123456" }),
    api_version: Type.String(),
    data: Type.Object(
      {
        // object: Type.Union(
        //   [stripeEventsExampleObject],
        //   { additionalProperties: true }
        // ),
        object: Type.Any(),
        previous_attributes: Type.Optional(Type.String()),
      }
    ),
    request: stripeEventsRequest,
    type: Type.String(),
    object: Type.Optional(Type.String()),
    account: Type.Optional(Type.String()),
    created: Type.Optional(Type.Integer()),
    livemode: Type.Optional(Type.Boolean()),
    pending_webhooks: Type.Optional(Type.Integer()),
  },
  { $id: 'StripeEvents', additionalProperties: false }
)
export const stripeEventsValidator = getValidator(stripeEventsSchema, dataValidator)
export const stripeEventsResolver = resolve({})

export const stripeEventsExternalResolver = resolve({})

// Schema for creating new entries
export const stripeEventsDataSchema = Type.Pick(
  stripeEventsSchema,
  [
    'id',
    'api_version',
    'data',
    'request',
    'type',
    `object`,
    `account`,
    `created`,
    `livemode`,
    `pending_webhooks`,
  ],
  {
    $id: 'StripeEventsData'
  }
)
export const stripeEventsDataValidator = getValidator(stripeEventsDataSchema, dataValidator)
export const stripeEventsDataResolver = resolve({
  processed: async () => false,
  whenWebHookCalled: async () => Date.now(),
})

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
