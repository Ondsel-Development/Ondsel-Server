// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'
import { BadRequest } from '@feathersjs/errors'

import { dataValidator, queryValidator } from '../../validators.js'
import {specificAgreementSummaryType} from "../agreements/agreements.schema.js";

export const agreementsAcceptedSchema = Type.Object(
  {
    currentPrivacyPolicyVersion: Type.Union([Type.String(), Type.Null()]),
    currentTermsOfServiceVersion: Type.Union([Type.String(), Type.Null()]),
    history: Type.Array(specificAgreementSummaryType),
  }
)

// Main data model schema
export const userSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    email: Type.String({ format: "email"}),
    password: Type.Optional(Type.String()),
    firstName: Type.String(),
    lastName: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    tier: StringEnum(['Free', 'Premium', 'Enterprise']),
    agreementAccepted: Type.Optional(agreementsAcceptedSchema),
  },
  { $id: 'User', additionalProperties: false }
)
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve({

  tier: virtual(async (message, context) => {
    return message.tier || "Free"
  })

})

export const userExternalResolver = resolve({
  // The password should never be visible externally
  password: async () => undefined,
})

// Schema for creating new entries
export const userDataSchema = Type.Pick(userSchema, ['email', 'password', 'firstName', 'lastName'], {
  $id: 'UserData'
})
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  tier: async () => "Free",
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
export const userQueryProperties = Type.Pick(userSchema, ['_id', 'email', 'firstName', 'lastName', 'tier'])
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
