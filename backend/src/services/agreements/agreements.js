// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  agreementsDataValidator,
  agreementsPatchValidator,
  agreementsQueryValidator,
  agreementsResolver,
  agreementsExternalResolver,
  agreementsDataResolver,
  agreementsPatchResolver,
  agreementsQueryResolver, agreementsSchema, agreementsQuerySchema
} from './agreements.schema.js'
import { AgreementsService, getOptions } from './agreements.class.js'
import { agreementsPath, agreementsMethods } from './agreements.shared.js'
import {authenticate} from "@feathersjs/authentication";
import swagger from "feathers-swagger";

export * from './agreements.class.js'
export * from './agreements.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const agreements = (app) => {
  // Register our service on the Feathers application
  app.use(agreementsPath, new AgreementsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: agreementsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { agreementsSchema, agreementsQuerySchema },
      docs: {
        description: 'An agreements service',
        idType: 'string',
        securities: ['all'],
      }
    }),
  })
  // Initialize hooks
  app.service(agreementsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(agreementsExternalResolver),
        schemaHooks.resolveResult(agreementsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(agreementsQueryValidator),
        schemaHooks.resolveQuery(agreementsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(agreementsDataValidator),
        schemaHooks.resolveData(agreementsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(agreementsPatchValidator),
        schemaHooks.resolveData(agreementsPatchResolver)
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
