// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  acceptAgreementDataValidator,
  acceptAgreementPatchValidator,
  acceptAgreementQueryValidator,
  acceptAgreementResolver,
  acceptAgreementExternalResolver,
  acceptAgreementDataResolver,
  acceptAgreementPatchResolver,
  acceptAgreementQueryResolver
} from './accept.schema.js'
import { AcceptAgreementService, getOptions } from './accept.class.js'
import { acceptAgreementPath, acceptAgreementMethods } from './accept.shared.js'

export * from './accept.class.js'
export * from './accept.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const acceptAgreement = (app) => {
  // Register our service on the Feathers application
  app.use(acceptAgreementPath, new AcceptAgreementService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: acceptAgreementMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(acceptAgreementPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(acceptAgreementExternalResolver),
        schemaHooks.resolveResult(acceptAgreementResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(acceptAgreementQueryValidator),
        schemaHooks.resolveQuery(acceptAgreementQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(acceptAgreementDataValidator),
        schemaHooks.resolveData(acceptAgreementDataResolver)
      ],
      patch: [
        schemaHooks.validateData(acceptAgreementPatchValidator),
        schemaHooks.resolveData(acceptAgreementPatchResolver)
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
