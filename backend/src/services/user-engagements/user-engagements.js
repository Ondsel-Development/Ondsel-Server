// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  userEngagementsDataValidator,
  userEngagementsPatchValidator,
  userEngagementsQueryValidator,
  userEngagementsResolver,
  userEngagementsExternalResolver,
  userEngagementsDataResolver,
  userEngagementsPatchResolver,
  userEngagementsQueryResolver
} from './user-engagements.schema.js'
import { UserEngagementsService, getOptions } from './user-engagements.class.js'
import { userEngagementsPath, userEngagementsMethods } from './user-engagements.shared.js'
import {disallow} from "feathers-hooks-common";

export * from './user-engagements.class.js'
export * from './user-engagements.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const userEngagements = (app) => {
  // Register our service on the Feathers application
  app.use(userEngagementsPath, new UserEngagementsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userEngagementsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(userEngagementsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(userEngagementsExternalResolver),
        schemaHooks.resolveResult(userEngagementsResolver)
      ]
    },
    before: {
      all: [
        disallow('external'),
        schemaHooks.validateQuery(userEngagementsQueryValidator),
        schemaHooks.resolveQuery(userEngagementsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(userEngagementsDataValidator),
        schemaHooks.resolveData(userEngagementsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(userEngagementsPatchValidator),
        schemaHooks.resolveData(userEngagementsPatchResolver)
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
