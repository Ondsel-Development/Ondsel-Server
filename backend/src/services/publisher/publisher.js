// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  publisherDataValidator,
  publisherPatchValidator,
  publisherQueryValidator,
  publisherResolver,
  publisherExternalResolver,
  publisherDataResolver,
  publisherPatchResolver,
  publisherQueryResolver
} from './publisher.schema.js'
import { PublisherService, getOptions } from './publisher.class.js'
import { publisherPath, publisherMethods } from './publisher.shared.js'

export * from './publisher.class.js'
export * from './publisher.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const publisher = (app) => {
  // Register our service on the Feathers application
  app.use(publisherPath, new PublisherService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: publisherMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(publisherPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(publisherExternalResolver),
        schemaHooks.resolveResult(publisherResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(publisherQueryValidator),
        schemaHooks.resolveQuery(publisherQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(publisherDataValidator),
        schemaHooks.resolveData(publisherDataResolver)
      ],
      patch: [
        schemaHooks.validateData(publisherPatchValidator),
        schemaHooks.resolveData(publisherPatchResolver)
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
