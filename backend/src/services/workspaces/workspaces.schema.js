// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { groupSummary } from '../groups/groups.subdocs.schema.js';
import { directorySummary } from '../directories/directories.subdocs.js';

const groupsOrUsers = Type.Object(
  {
    type: StringEnum(['User', 'Group']),
    permission: StringEnum(['read', 'write']),
    groupOrUser: Type.Union([userSummarySchema, groupSummary])
  }
)

// Main data model schema
export const workspaceSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    description: Type.String(),
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    organizationId: ObjectIdSchema(),
    rootDirectory: directorySummary,
    groupsOrUsers: Type.Array(groupsOrUsers),
  },
  { $id: 'Workspace', additionalProperties: false }
)
export const workspaceValidator = getValidator(workspaceSchema, dataValidator)
export const workspaceResolver = resolve({})

export const workspaceExternalResolver = resolve({})

// Schema for creating new entries
export const workspaceDataSchema = Type.Pick(workspaceSchema, ['name', 'description', 'organizationId'], {
  $id: 'WorkspaceData'
})
export const workspaceDataValidator = getValidator(workspaceDataSchema, dataValidator)
export const workspaceDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  groupsOrUsers: async (_value, _message, _context) => {
    return [
      {
        type: 'User',
        permission: 'write',
        groupOrUser: _.pick(_context.params.user,  ['_id', 'username', 'email', 'name']),
      }
    ]
  }
})

// Schema for updating existing entries
export const workspacePatchSchema = Type.Partial(workspaceSchema, {
  $id: 'WorkspacePatch'
})
export const workspacePatchValidator = getValidator(workspacePatchSchema, dataValidator)
export const workspacePatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const workspaceQueryProperties = Type.Pick(workspaceSchema, ['_id', 'name', 'organizationId'])
export const workspaceQuerySchema = Type.Intersect(
  [
    querySyntax(workspaceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const workspaceQueryValidator = getValidator(workspaceQuerySchema, queryValidator)
export const workspaceQueryResolver = resolve({})
