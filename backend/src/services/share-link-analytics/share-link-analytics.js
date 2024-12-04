// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  shareLinkAnalyticsDataValidator,
  shareLinkAnalyticsPatchValidator,
  shareLinkAnalyticsQueryValidator,
  shareLinkAnalyticsResolver,
  shareLinkAnalyticsExternalResolver,
  shareLinkAnalyticsDataResolver,
  shareLinkAnalyticsPatchResolver,
  shareLinkAnalyticsQueryResolver,
  shareLinkAnalyticsPatchSchema,
  shareLinkAnalyticsDataSchema,
  shareLinkAnalyticsQuerySchema,
  shareLinkAnalyticsSchema,
} from './share-link-analytics.schema.js'
import { ShareLinkAnalyticsService, getOptions } from './share-link-analytics.class.js'
import { shareLinkAnalyticsPath, shareLinkAnalyticsMethods } from './share-link-analytics.shared.js'
import {disallow} from "feathers-hooks-common";
import {authenticateJwtWhenPrivate, tryToAuthenticate} from "../../hooks/handle-public-info-query.js";
import swagger from "feathers-swagger";

export * from './share-link-analytics.class.js'
export * from './share-link-analytics.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const shareLinkAnalytics = (app) => {
  // Register our service on the Feathers application
  app.use(shareLinkAnalyticsPath, new ShareLinkAnalyticsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: shareLinkAnalyticsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { shareLinkAnalyticsSchema, shareLinkAnalyticsDataSchema, shareLinkAnalyticsQuerySchema, shareLinkAnalyticsPatchSchema },
      docs: {
        description: 'A Share link analytics service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(shareLinkAnalyticsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(shareLinkAnalyticsExternalResolver),
        schemaHooks.resolveResult(shareLinkAnalyticsResolver)
      ],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [tryToAuthenticate()],
      update: [disallow('external')],
      patch: [disallow('external')],
      remove: [disallow('external')],
    },
    before: {
      all: [
        schemaHooks.validateQuery(shareLinkAnalyticsQueryValidator),
        schemaHooks.resolveQuery(shareLinkAnalyticsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(shareLinkAnalyticsDataValidator),
        schemaHooks.resolveData(shareLinkAnalyticsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(shareLinkAnalyticsPatchValidator),
        schemaHooks.resolveData(shareLinkAnalyticsPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
