// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  stripeEventsDataValidator,
  stripeEventsPatchValidator,
  stripeEventsQueryValidator,
  stripeEventsResolver,
  stripeEventsExternalResolver,
  stripeEventsDataResolver,
  stripeEventsPatchResolver,
  stripeEventsQueryResolver, stripeEventsSchema
} from './stripe-events.schema.js'
import { StripeEventsService, getOptions } from './stripe-events.class.js'
import { stripeEventsPath, stripeEventsMethods } from './stripe-events.shared.js'
import swagger from "feathers-swagger";
import {accountEventOptionsSchema, accountEventSchema} from "../account-event/account-event.schema.js";

export * from './stripe-events.class.js'
export * from './stripe-events.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const stripeEvents = (app) => {
  // Register our service on the Feathers application
  app.use(stripeEventsPath, new StripeEventsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: stripeEventsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { stripeEventsSchema },
      docs: {
        description: 'An entry point for new Stripe webhook events for later processing',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(stripeEventsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(stripeEventsExternalResolver),
        schemaHooks.resolveResult(stripeEventsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(stripeEventsQueryValidator),
        schemaHooks.resolveQuery(stripeEventsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(stripeEventsDataValidator),
        schemaHooks.resolveData(stripeEventsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(stripeEventsPatchValidator),
        schemaHooks.resolveData(stripeEventsPatchResolver)
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
