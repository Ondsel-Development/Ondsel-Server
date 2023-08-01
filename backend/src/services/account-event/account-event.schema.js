// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import {Type, getValidator, querySyntax, StringEnum} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {SubscriptionStateType, SubscriptionType, userSummarySchema} from "../users/users.subdocs.schema.js";
import {ObjectId} from "mongodb";

// Main data model schema
export const AccountEventTypeMap = {
  initialSubscriptionPurchase : 'initial-subscription-purchase',
  recurringSubscriptionPurchase: 'recurring-subscription-purchase',
  subscriptionServiceCompleted: 'subscription-service-completed',
  subscriptionRefundPayable: 'subscription-refund-payable',
  refundPaid: 'refund-paid',
}

export const AccountEventType = StringEnum(
  [
    AccountEventTypeMap.initialSubscriptionPurchase,
    AccountEventTypeMap.recurringSubscriptionPurchase,
    AccountEventTypeMap.subscriptionServiceCompleted,
    AccountEventTypeMap.subscriptionRefundPayable,
    AccountEventTypeMap.refundPaid,
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
    transactionId: ObjectIdSchema(),  // must be kept separate from _id to prevent the framework from mangling it.
    event: AccountEventType,
    userId: Type.Optional(ObjectIdSchema()),
    createdAt: Type.Number(),
    note: Type.String(), // not seen by end user
    amount: Type.Optional(Type.Integer()),
    detail: accountEventOptionsSchema,
    success: Type.Boolean(),
    resultMsg: Type.Optional(Type.String())
  },
  { $id: 'AccountEvent', additionalProperties: true }
)

export const accountEventValidator = getValidator(accountEventSchema, dataValidator)
export const accountEventResolver = resolve({})

export const accountEventExternalResolver = resolve({})

// Schema for creating new entries
export const accountEventDataSchema = Type.Pick(accountEventSchema, ['text'], {
  $id: 'AccountEventData'
})
export const accountEventDataValidator = getValidator(accountEventDataSchema, dataValidator)
export const accountEventDataResolver = resolve({
  _id: async () => new ObjectId(),
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
