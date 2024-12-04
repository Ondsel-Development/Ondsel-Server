// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {userSummarySchema} from "../users/users.subdocs.schema.js";
import {SourceType} from "../user-engagements/user-engagement.subdocs.schema.js";
import {buildUserSummary} from "../users/users.distrib.js";

// Main data model schema
export const shareLinkAnalyticsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    sharedModelId: ObjectIdSchema(),
    accessedBy: Type.Optional(userSummarySchema),
    accessedFrom: SourceType,
    accessedAt: Type.Number(),
    additionalData: Type.Optional(Type.Object({})),
  },
  { $id: 'ShareLinkAnalytics', additionalProperties: false }
)
export const shareLinkAnalyticsValidator = getValidator(shareLinkAnalyticsSchema, dataValidator)
export const shareLinkAnalyticsResolver = resolve({})

export const shareLinkAnalyticsExternalResolver = resolve({})

// Schema for creating new entries
export const shareLinkAnalyticsDataSchema = Type.Pick(shareLinkAnalyticsSchema, [
  'sharedModelId',
  'accessedFrom',
  'additionalData',
], {
  $id: 'ShareLinkAnalyticsData'
})
export const shareLinkAnalyticsDataValidator = getValidator(shareLinkAnalyticsDataSchema, dataValidator)
export const shareLinkAnalyticsDataResolver = resolve({
  accessedBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    if (context.params.user) {
      return buildUserSummary(context.params.user);
    }
    return undefined;
  },
  accessedAt: async () => Date.now(),
})

// Schema for updating existing entries
export const shareLinkAnalyticsPatchSchema = Type.Partial(shareLinkAnalyticsSchema, {
  $id: 'ShareLinkAnalyticsPatch'
})
export const shareLinkAnalyticsPatchValidator = getValidator(shareLinkAnalyticsPatchSchema, dataValidator)
export const shareLinkAnalyticsPatchResolver = resolve({})

// Schema for allowed query properties
export const shareLinkAnalyticsQueryProperties = Type.Pick(shareLinkAnalyticsSchema, [
  '_id', 'sharedModelId', 'accessedBy', 'accessedAt', 'accessedFrom'
])
export const shareLinkAnalyticsQuerySchema = Type.Intersect(
  [
    querySyntax(shareLinkAnalyticsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const shareLinkAnalyticsQueryValidator = getValidator(shareLinkAnalyticsQuerySchema, queryValidator)
export const shareLinkAnalyticsQueryResolver = resolve({})
