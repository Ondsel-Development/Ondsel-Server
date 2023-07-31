// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  accountEventDataValidator,
  accountEventPatchValidator,
  accountEventQueryValidator,
  accountEventResolver,
  accountEventExternalResolver,
  accountEventDataResolver,
  accountEventPatchResolver,
  accountEventQueryResolver
} from './account-event.schema.js'
import { AccountEventService, getOptions } from './account-event.class.js'
import { accountEventPath, accountEventMethods } from './account-event.shared.js'
import {clearResultsFieldsToDefault, performAccountEventLogic} from "../../hooks/accountEventBusinessLogic.js";

const { disallow } = require('feathers-hooks-common');

export * from './account-event.class.js'
export * from './account-event.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const accountEvent = (app) => {
  // Register our service on the Feathers application
  app.use(accountEventPath, new AccountEventService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: accountEventMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(accountEventPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(accountEventExternalResolver),
        schemaHooks.resolveResult(accountEventResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(accountEventQueryValidator),
        schemaHooks.resolveQuery(accountEventQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(accountEventDataValidator),
        schemaHooks.resolveData(accountEventDataResolver),
        clearResultsFieldsToDefault(),
        performAccountEventLogic(),
      ],
      patch: [ disallow() ], // the accountEventLog may never be deleted from or altered
      remove: [ disallow() ] // the accountEventLog may never be deleted from or altered
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
