// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { isProvider } from 'feathers-hooks-common';

const userDataSchema = Type.Intersect(
  [
    userSummarySchema,
    Type.Object({ isAdmin: Type.Boolean() }),
  ]
)

// Main data model schema
export const organizationSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    users: Type.Array(userDataSchema),
    // Soft delete
    deleted: Type.Optional(Type.Boolean()),
  },
  { $id: 'Organization', additionalProperties: false }
)
export const organizationValidator = getValidator(organizationSchema, dataValidator)
export const organizationResolver = resolve({})

export const organizationExternalResolver = resolve({})

// Schema for creating new entries
export const organizationDataSchema = Type.Pick(organizationSchema, ['name'], {
  $id: 'OrganizationData'
})
export const organizationDataValidator = getValidator(organizationDataSchema, dataValidator)
export const organizationDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  users: async (_value, _message, context) => {
    return [
      {
        ..._.pick(context.params.user,  ['_id', 'username', 'email', 'firstName', 'lastName']),
        isAdmin: true,
      }
    ]
  },
})

// Schema for updating existing entries
export const organizationPatchSchema = Type.Partial(organizationSchema, {
  $id: 'OrganizationPatch'
})
export const organizationPatchValidator = getValidator(organizationPatchSchema, dataValidator)
export const organizationPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const organizationQueryProperties = Type.Pick(organizationSchema, ['_id', 'name', 'createdBy', 'deleted'])
export const organizationQuerySchema = Type.Intersect(
  [
    querySyntax(organizationQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const organizationQueryValidator = getValidator(organizationQuerySchema, queryValidator)
export const organizationQueryResolver = resolve({})
