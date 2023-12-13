// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import {resolve, virtual} from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { workspaceSummary } from '../workspaces/workspaces.subdocs.schema.js';

// Main data model schema
export const groupSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    organizationId: ObjectIdSchema(),
    users: Type.Optional(Type.Array(userSummarySchema)),
    workspaces: Type.Array(workspaceSummary),
    takeAllNewUsers: Type.Boolean(), // when a user is added to a org, should this group see that user automatically?
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
export const groupDataSchema = Type.Pick(groupSchema, ['name', 'organizationId', 'users', 'takeAllNewUsers'], {
  // note: _id and name can only be set by the internal system
  $id: 'GroupData'
})
export const groupDataValidator = getValidator(groupDataSchema, dataValidator)
export const groupDataResolver = resolve({
  takeAllNewUsers: async (_value, message, _context) => {
    return message.takeAllNewUsers || false
  },
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  users: async (_value, message, _context) => {
    return message.users || [];
  }
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
export const groupQueryProperties = Type.Pick(groupSchema, ['_id', 'name', 'organizationId', 'users'])
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
