// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  sitemapsDataValidator,
  sitemapsPatchValidator,
  sitemapsQueryValidator,
  sitemapsResolver,
  sitemapsExternalResolver,
  sitemapsDataResolver,
  sitemapsPatchResolver,
  sitemapsQueryResolver
} from './sitemaps.schema.js'
import { SitemapsService, getOptions } from './sitemaps.class.js'
import { sitemapsPath, sitemapsMethods } from './sitemaps.shared.js'
import {disallow} from "feathers-hooks-common";

export * from './sitemaps.class.js'
export * from './sitemaps.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const sitemaps = (app) => {
  // Register our service on the Feathers application
  app.use(sitemapsPath, new SitemapsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sitemapsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(sitemapsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(sitemapsExternalResolver),
        schemaHooks.resolveResult(sitemapsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(sitemapsQueryValidator),
        schemaHooks.resolveQuery(sitemapsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        disallow('external'),
        schemaHooks.validateData(sitemapsDataValidator),
        schemaHooks.resolveData(sitemapsDataResolver)
      ],
      patch: [
        disallow('external'),
        schemaHooks.validateData(sitemapsPatchValidator),
        schemaHooks.resolveData(sitemapsPatchResolver)
      ],
      remove: [
        disallow('external'),
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
