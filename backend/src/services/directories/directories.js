// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  directoryDataValidator,
  directoryPatchValidator,
  directoryQueryValidator,
  directoryResolver,
  directoryExternalResolver,
  directoryDataResolver,
  directoryPatchResolver,
  directoryQueryResolver
} from './directories.schema.js'
import { DirectoryService, getOptions } from './directories.class.js'
import { directoryPath, directoryMethods } from './directories.shared.js'

export * from './directories.class.js'
export * from './directories.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const directory = (app) => {
  // Register our service on the Feathers application
  app.use(directoryPath, new DirectoryService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: directoryMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(directoryPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(directoryExternalResolver),
        schemaHooks.resolveResult(directoryResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(directoryQueryValidator),
        schemaHooks.resolveQuery(directoryQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(directoryDataValidator),
        schemaHooks.resolveData(directoryDataResolver)
      ],
      patch: [
        schemaHooks.validateData(directoryPatchValidator),
        schemaHooks.resolveData(directoryPatchResolver)
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
