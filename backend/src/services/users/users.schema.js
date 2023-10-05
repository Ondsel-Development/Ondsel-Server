// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'
import { BadRequest } from '@feathersjs/errors'
import { dataValidator, queryValidator } from '../../validators.js'

import {
  agreementsAcceptedSchema, journalElementSchema, journalTransactionSchema, subscriptionDetailSchema,
  SubscriptionStateMap,
  SubscriptionStateType, SubscriptionTermType,
  SubscriptionType, SubscriptionTypeMap,
  userAccountingSchema
} from "./users.subdocs.schema.js";
import {ObjectId} from "mongodb";
import {usernameHasher} from "../../usernameFunctions.js";

// Main data model schema
export const userSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    email: Type.String({ format: "email"}),
    organizationId: Type.Union([Type.Null(), ObjectIdSchema()]),
    password: Type.Optional(Type.String()),
    username: Type.String(),
    usernameHash: Type.Number(),
    firstName: Type.String(),
    lastName: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    tier: SubscriptionType,
    nextTier: Type.Optional(Type.Union([Type.Null(), SubscriptionType])), // non-null when a change is planned by the user.
    subscriptionDetail: subscriptionDetailSchema,
    userAccounting: userAccountingSchema,
    agreementsAccepted: Type.Optional(agreementsAcceptedSchema),
  },
  { $id: 'User', additionalProperties: false }
)
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve({

  tier: virtual(async (message, context) => {
    return message.tier || SubscriptionTypeMap.solo;
  }),
  nextTier: virtual(async (message, context) => {
    return message.nextTier || null
  }),
  subscriptionDetail: virtual(async (message, context) => {
    return message.subscriptionDetail || {
      state: SubscriptionStateMap.good,
      term: null,
      anniversary: null,
    }
  }),
})

export const userExternalResolver = resolve({
  // The password should never be visible externally
  password: async () => undefined,
})

// Schema for creating new entries
export const userDataSchema = Type.Pick(userSchema, ['email', 'password', 'username', 'firstName', 'lastName'], {
  $id: 'UserData'
})
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  usernameHash: async (_value, message, _context) => {
    return usernameHasher(message.username)
  },
  tier: async () => SubscriptionTypeMap.solo,
  nextTier: async () => null,
  userAccounting: async (_value, _message, _context) => {
    return {
      ledgerBalances: {
        Cash: 0,
        ProcessorExpense: 0,
        UnearnedRevenue: 0,
        Revenue: 0,
        SalesReturnsAndAllowances: 0,
      },
      journal: [
        {
          transactionId: new ObjectId(),
          time: Date.now(),
          description: "CREATION OF NEW ACCOUNT; TIER SET TO Solo",
          entries: [],
        }
      ],
    }
  },
})

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['_id', 'email', 'username', 'usernameHash', 'firstName', 'lastName', 'tier', 'nextTier', 'organizationId'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  _id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user._id
    }

    return value
  }
})


export const uniqueUserValidator = async (context) => {
  if (context.data.email) {
    const userService = context.app.service('users');
    const result = await userService.find({query: {email: context.data.email }});
    if (result.total > 0) {
      throw new BadRequest('Invalid Parameters', {
        errors: { email: 'Email already taken' }
      })
    }
  }
}
