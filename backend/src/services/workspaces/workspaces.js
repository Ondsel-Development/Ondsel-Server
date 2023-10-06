// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  workspaceDataValidator,
  workspacePatchValidator,
  workspaceQueryValidator,
  workspaceResolver,
  workspaceExternalResolver,
  workspaceDataResolver,
  workspacePatchResolver,
  workspaceQueryResolver
} from './workspaces.schema.js'
import { WorkspaceService, getOptions } from './workspaces.class.js'
import { workspacePath, workspaceMethods } from './workspaces.shared.js'

export * from './workspaces.class.js'
export * from './workspaces.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const workspace = (app) => {
  // Register our service on the Feathers application
  app.use(workspacePath, new WorkspaceService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: workspaceMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(workspacePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(workspaceExternalResolver),
        schemaHooks.resolveResult(workspaceResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(workspaceQueryValidator),
        schemaHooks.resolveQuery(workspaceQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(workspaceDataValidator),
        schemaHooks.resolveData(workspaceDataResolver)
      ],
      patch: [
        schemaHooks.validateData(workspacePatchValidator),
        schemaHooks.resolveData(workspacePatchResolver)
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
