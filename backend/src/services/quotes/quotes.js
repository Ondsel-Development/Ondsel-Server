// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  quotesDataValidator,
  quotesPatchValidator,
  quotesQueryValidator,
  quotesResolver,
  quotesExternalResolver,
  quotesDataResolver,
  quotesPatchResolver,
  quotesQueryResolver
} from './quotes.schema.js'
import { QuotesService, getOptions } from './quotes.class.js'
import { quotesPath, quotesMethods } from './quotes.shared.js'
import {disallow, iff, iffElse, isProvider} from "feathers-hooks-common";

export * from './quotes.class.js'
export * from './quotes.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const quotes = (app) => {
  // Register our service on the Feathers application
  app.use(quotesPath, new QuotesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: quotesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(quotesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(quotesExternalResolver),
        schemaHooks.resolveResult(quotesResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(quotesQueryValidator), schemaHooks.resolveQuery(quotesQueryResolver)],
      find: [],
      get: [],
      create: [
        disallow('external'),
        schemaHooks.validateData(quotesDataValidator),
        schemaHooks.resolveData(quotesDataResolver)
      ],
      patch: [
        iff(
          isProvider('external'),
          iffElse(context => context.data.shouldGenerateQuote,
            [], // TODO
            [disallow()]
          ),
        ),
        schemaHooks.validateData(quotesPatchValidator),
        schemaHooks.resolveData(quotesPatchResolver)
      ],
      remove: [disallow()]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
