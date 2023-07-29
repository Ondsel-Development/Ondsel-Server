// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import {Type, getValidator, querySyntax, StringEnum} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {SubscriptionStateType, userSummarySchema} from "../users/users.subdocs.schema.js";

// Main data model schema
export const AccountEventType = StringEnum(
    [
        'initial-subscription-purchase',
        'recurring-subscription-purchase',
        'subscription-service-completed',
        'subscription-refund-payable',
        'refund-paid',
    ]
)
export const SubscriptionType = StringEnum(
    [
        'free',
        'premium',
        'enterprise',
    ]
)

export const accountEventOptionsSchema = Type.Object(
    {
        // ALL fields in this schema should be optional
        subscription: Type.Optional(SubscriptionType),
        termAddedMonths: Type.Optional(Type.Number()),
        termFulfilledMonths: Type.Optional(Type.Number()),
        // the "current" fields are used for auditing. The represent what the calling algorithm thinks is true before
        // the event happens.
        currentSubscription: Type.Optional(SubscriptionType),
        currentSubscriptionState: Type.Optional(SubscriptionStateType),
        currentKeyBalance: Type.Optional(Type.Integer()),  // the meaning of "key" depends on the event
    }
)

export const accountEventSchema = Type.Object(
    {
        _id: ObjectIdSchema(),
        event: AccountEventType,
        userId: Type.Optional(ObjectIdSchema()),
        createdAt: Type.Number(),
        description: Type.String(),
        amount: Type.Optional(Type.Integer()),
        detail: Type.Object(accountEventOptionsSchema),
    },
    { $id: 'AccountEventLog', additionalProperties: false }
)
export const accountEventValidator = getValidator(accountEventSchema, dataValidator)
export const accountEventResolver = resolve({})

export const accountEventExternalResolver = resolve({})

// Schema for creating new entries
export const accountEventDataSchema = Type.Pick(accountEventSchema, ['text'], {
  $id: 'AccountEventData'
})
export const accountEventDataValidator = getValidator(accountEventDataSchema, dataValidator)
export const accountEventDataResolver = resolve({})

// Schema for updating existing entries
export const accountEventPatchSchema = Type.Partial(accountEventSchema, {
  $id: 'AccountEventPatch'
})
export const accountEventPatchValidator = getValidator(accountEventPatchSchema, dataValidator)
export const accountEventPatchResolver = resolve({})

// Schema for allowed query properties
export const accountEventQueryProperties = Type.Pick(accountEventSchema, ['_id', 'text'])
export const accountEventQuerySchema = Type.Intersect(
  [
    querySyntax(accountEventQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const accountEventQueryValidator = getValidator(accountEventQuerySchema, queryValidator)
export const accountEventQueryResolver = resolve({})
