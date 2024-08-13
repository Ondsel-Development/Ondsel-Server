// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  tripeDataValidator,
  tripePatchValidator,
  tripeQueryValidator,
  tripeResolver,
  tripeExternalResolver,
  tripeDataResolver,
  tripePatchResolver,
  tripeQueryResolver
} from './tripe.schema.js'
import { TripeService, getOptions } from './tripe.class.js'
import { tripePath, tripeMethods } from './tripe.shared.js'

export * from './tripe.class.js'
export * from './tripe.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const tripe = (app) => {
  // Register our service on the Feathers application
  app.use(tripePath, new TripeService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: tripeMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(tripePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(tripeExternalResolver),
        schemaHooks.resolveResult(tripeResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(tripeQueryValidator), schemaHooks.resolveQuery(tripeQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(tripeDataValidator), schemaHooks.resolveData(tripeDataResolver)],
      patch: [schemaHooks.validateData(tripePatchValidator), schemaHooks.resolveData(tripePatchResolver)],
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
