// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, StringEnum, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSummarySchema} from '../users/users.subdocs.schema.js';
import { buildUserSummary } from '../users/users.distrib.js';
import { ConnectionType, SourceType } from './user-engagement.subdocs.schema.js';

// Main data model schema
export const userEngagementsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    event: Type.Optional(Type.String()),
    source: SourceType,
    version: Type.Optional(Type.String()),
    createdAt: Type.Number(),
    createdBy: userSummarySchema,
    path: Type.String(),
    method: Type.String(),
    contextId: Type.Optional(ObjectIdSchema()),
    query: Type.Optional(Type.Object({})),
    payload: Type.Optional(Type.Object({})),
    connection: ConnectionType,
    additionalData: Type.Optional(Type.Object({})),
  },
  { $id: 'UserEngagements', additionalProperties: false }
)
export const userEngagementsValidator = getValidator(userEngagementsSchema, dataValidator)
export const userEngagementsResolver = resolve({})

export const userEngagementsExternalResolver = resolve({})

// Schema for creating new entries
export const userEngagementsDataSchema = Type.Pick(userEngagementsSchema, [
  'event',
  'source',
  'path',
  'method',
  'contextId',
  'query',
  'connection',
  'version',
  'payload',
  'additionalData',
], {
  $id: 'UserEngagementsData'
})
export const userEngagementsDataValidator = getValidator(userEngagementsDataSchema, dataValidator)
export const userEngagementsDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return buildUserSummary(context.params.user);
  },
  createdAt: async () => Date.now(),
})

// Schema for updating existing entries
export const userEngagementsPatchSchema = Type.Partial(userEngagementsSchema, {
  $id: 'UserEngagementsPatch'
})
export const userEngagementsPatchValidator = getValidator(userEngagementsPatchSchema, dataValidator)
export const userEngagementsPatchResolver = resolve({})

// Schema for allowed query properties
export const userEngagementsQueryProperties = Type.Pick(userEngagementsSchema, [
  '_id',
  'event',
  'source',
  'connection',
  'path',
  'method',
  'createdAt',
  'createdBy',
  'source',
  'contextId',
  'version',
])
export const userEngagementsQuerySchema = Type.Intersect(
  [
    querySyntax(userEngagementsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const userEngagementsQueryValidator = getValidator(userEngagementsQuerySchema, queryValidator)
export const userEngagementsQueryResolver = resolve({})
