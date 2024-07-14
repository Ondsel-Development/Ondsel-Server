// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  orgOrdersDataValidator,
  orgOrdersPatchValidator,
  orgOrdersQueryValidator,
  orgOrdersResolver,
  orgOrdersExternalResolver,
  orgOrdersDataResolver,
  orgOrdersPatchResolver,
  orgOrdersQueryResolver
} from './org-orders.schema.js'
import { OrgOrdersService, getOptions } from './org-orders.class.js'
import { orgOrdersPath, orgOrdersMethods } from './org-orders.shared.js'

export * from './org-orders.class.js'
export * from './org-orders.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const orgOrders = (app) => {
  // Register our service on the Feathers application
  app.use(orgOrdersPath, new OrgOrdersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: orgOrdersMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(orgOrdersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(orgOrdersExternalResolver),
        schemaHooks.resolveResult(orgOrdersResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(orgOrdersQueryValidator),
        schemaHooks.resolveQuery(orgOrdersQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(orgOrdersDataValidator),
        schemaHooks.resolveData(orgOrdersDataResolver)
      ],
      patch: [
        schemaHooks.validateData(orgOrdersPatchValidator),
        schemaHooks.resolveData(orgOrdersPatchResolver)
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
