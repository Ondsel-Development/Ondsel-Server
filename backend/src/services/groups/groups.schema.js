// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { workspaceSchema } from '../workspaces/workspaces.schema.js';

// Main data model schema
export const groupSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    organizationId: ObjectIdSchema(),
    members: Type.Array(userSummarySchema),
    workspaces: Type.Array(workspaceSchema),
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
  },
  { $id: 'Group', additionalProperties: false }
)
export const groupValidator = getValidator(groupSchema, dataValidator)
export const groupResolver = resolve({})

export const groupExternalResolver = resolve({})

// Schema for creating new entries
export const groupDataSchema = Type.Pick(groupSchema, ['name', 'organizationId'], {
  $id: 'GroupData'
})
export const groupDataValidator = getValidator(groupDataSchema, dataValidator)
export const groupDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
})

// Schema for updating existing entries
export const groupPatchSchema = Type.Partial(groupSchema, {
  $id: 'GroupPatch'
})
export const groupPatchValidator = getValidator(groupPatchSchema, dataValidator)
export const groupPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const groupQueryProperties = Type.Pick(groupSchema, ['_id', 'name', 'organizationId'])
export const groupQuerySchema = Type.Intersect(
  [
    querySyntax(groupQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const groupQueryValidator = getValidator(groupQuerySchema, queryValidator)
export const groupQueryResolver = resolve({})
