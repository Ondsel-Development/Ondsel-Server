// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  runnerLogsDataValidator,
  runnerLogsPatchValidator,
  runnerLogsQueryValidator,
  runnerLogsResolver,
  runnerLogsExternalResolver,
  runnerLogsDataResolver,
  runnerLogsPatchResolver,
  runnerLogsQueryResolver
} from './runner-logs.schema.js'
import { RunnerLogsService, getOptions } from './runner-logs.class.js'
import { runnerLogsPath, runnerLogsMethods } from './runner-logs.shared.js'

export * from './runner-logs.class.js'
export * from './runner-logs.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const runnerLogs = (app) => {
  // Register our service on the Feathers application
  app.use(runnerLogsPath, new RunnerLogsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: runnerLogsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(runnerLogsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(runnerLogsExternalResolver),
        schemaHooks.resolveResult(runnerLogsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(runnerLogsQueryValidator),
        schemaHooks.resolveQuery(runnerLogsQueryResolver)
      ],
      find: [],
      get: [disallow('external')],
      create: [
        schemaHooks.validateData(runnerLogsDataValidator),
        schemaHooks.resolveData(runnerLogsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(runnerLogsPatchValidator),
        schemaHooks.resolveData(runnerLogsPatchResolver)
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
