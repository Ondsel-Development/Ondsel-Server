// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  notificationsDataValidator,
  notificationsPatchValidator,
  notificationsQueryValidator,
  notificationsResolver,
  notificationsExternalResolver,
  notificationsDataResolver,
  notificationsPatchResolver,
  notificationsQueryResolver,
  notificationsSchema,
  notificationsDataSchema,
  notificationsPatchSchema,
  notificationsQuerySchema
} from './notifications.schema.js'
import { NotificationsService, getOptions } from './notifications.class.js'
import { notificationsPath, notificationsMethods } from './notifications.shared.js'
import {disallow} from "feathers-hooks-common";
import swagger from "feathers-swagger";

export * from './notifications.class.js'
export * from './notifications.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const notifications = (app) => {
  // Register our service on the Feathers application
  app.use(notificationsPath, new NotificationsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: notificationsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: {notificationsSchema, notificationsDataSchema, notificationsPatchSchema, notificationsQuerySchema, },
      docs: {
        description: 'Notifications service and logger',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(notificationsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(notificationsExternalResolver),
        schemaHooks.resolveResult(notificationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(notificationsQueryValidator),
        schemaHooks.resolveQuery(notificationsQueryResolver)
      ],
      find: [
        disallow('external'),
      ],
      get: [
        disallow('external'),
      ],
      create: [
        schemaHooks.validateData(notificationsDataValidator),
        schemaHooks.resolveData(notificationsDataResolver)
      ],
      patch: [
        disallow('external'),
        schemaHooks.validateData(notificationsPatchValidator),
        schemaHooks.resolveData(notificationsPatchResolver)
      ],
      remove: [
        disallow('external'),
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
