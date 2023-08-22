// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import {Type, getValidator, querySyntax, StringEnum} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {SubscriptionStateType, SubscriptionType, userSummarySchema} from "../users/users.subdocs.schema.js";
import {ObjectId} from "mongodb";
import {CurrencyType} from "../../currencies.js";

// Main data model schema
export const AccountEventTypeMap = {
  initialSubscriptionPurchase : 'initial-subscription-purchase',
  recurringSubscriptionPurchase: 'recurring-subscription-purchase',
  subscriptionServiceCompleted: 'subscription-service-completed',
  subscriptionRefund: 'subscription-refund',
  subscriptionTierDowngrade: 'subscription-tier-downgrade',
  // TODO:
  // 'subscription-tier-upgrade'    // the amount needs to be properly pre-computed. make an API for that? to enterprise right now
}

export const AccountEventType = StringEnum(
  [
    AccountEventTypeMap.initialSubscriptionPurchase,
    AccountEventTypeMap.recurringSubscriptionPurchase,
    AccountEventTypeMap.subscriptionServiceCompleted,
    AccountEventTypeMap.subscriptionRefund,
    AccountEventTypeMap.subscriptionTierDowngrade,
  ]
)

export const accountEventOptionsSchema = Type.Object(
  {
    // ALL fields in this schema should be optional
    subscription: Type.Optional(SubscriptionType),
    term: Type.Optional(Type.String()),
    // the "current" fields are used for auditing. They represent what the calling algorithm thinks is true before
    // the event happens.
    currentSubscription: Type.Optional(SubscriptionType),
  }
)

export const accountEventSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    transactionId: ObjectIdSchema(),  // must be kept separate from _id to prevent the framework from mangling it.
    event: AccountEventType,
    userId: ObjectIdSchema(),
    createdAt: Type.Number(),
    note: Type.String(), // not seen by end user
    amount: Type.Optional(Type.Integer()),
    originalCurrency: Type.Optional(CurrencyType),
    originalAmt: Type.Optional(Type.String()),
    detail: accountEventOptionsSchema,
    success: Type.Boolean(),
    resultMsg: Type.Optional(Type.String()),
    additionalData: Type.Optional(Type.Object({}))
  },
  { $id: 'AccountEvent', additionalProperties: true }
)

export const accountEventValidator = getValidator(accountEventSchema, dataValidator)
export const accountEventResolver = resolve({})

export const accountEventExternalResolver = resolve({})

// Schema for creating new entries
export const accountEventDataSchema = Type.Pick(accountEventSchema, [
  'event',
  'note',
  'detail',
], {
  $id: 'AccountEventData'
})
export const accountEventDataValidator = getValidator(accountEventDataSchema, dataValidator)
export const accountEventDataResolver = resolve({
  _id: async () => new ObjectId(),
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  success: async () => false,
  resultMsg: async () => "Internal error: performAccountEventLogic never completed; nor did it record a real error.",
})

// Schema for updating existing entries
export const accountEventPatchSchema = Type.Partial(accountEventSchema, {
  $id: 'AccountEventPatch'
})
export const accountEventPatchValidator = getValidator(accountEventPatchSchema, dataValidator)
export const accountEventPatchResolver = resolve({})

// Schema for allowed query properties
export const accountEventQueryProperties = Type.Pick(accountEventSchema, ['_id', 'userId'])
export const accountEventQuerySchema = Type.Intersect(
  [
    querySyntax(accountEventQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const accountEventQueryValidator = getValidator(accountEventQuerySchema, queryValidator)
export const accountEventQueryResolver = resolve({
  // user are only allowed to see their own data
  userId: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user._id
    }
    return value
  }
})
