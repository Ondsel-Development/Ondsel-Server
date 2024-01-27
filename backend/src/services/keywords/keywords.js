// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  keywordsDataValidator,
  keywordsPatchValidator,
  keywordsQueryValidator,
  keywordsResolver,
  keywordsExternalResolver,
  keywordsDataResolver,
  keywordsPatchResolver,
  keywordsQueryResolver
} from './keywords.schema.js'
import { KeywordsService, getOptions } from './keywords.class.js'
import { keywordsPath, keywordsMethods } from './keywords.shared.js'

export * from './keywords.class.js'
export * from './keywords.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const keywords = (app) => {
  // Register our service on the Feathers application
  app.use(keywordsPath, new KeywordsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: keywordsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(keywordsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(keywordsExternalResolver),
        schemaHooks.resolveResult(keywordsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(keywordsQueryValidator),
        schemaHooks.resolveQuery(keywordsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(keywordsDataValidator),
        schemaHooks.resolveData(keywordsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(keywordsPatchValidator),
        schemaHooks.resolveData(keywordsPatchResolver)
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
