// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  notificationsPatchValidator,
  notificationsQueryValidator,
  notificationsResolver,
  notificationsPatchResolver,
  notificationsQueryResolver,
  notificationsSchema,
  notificationsDataSchema,
  notificationsPatchSchema,
  notificationsQuerySchema
} from './notifications.schema.js'
import { NotificationsService, getOptions } from './notifications.class.js'
import { notificationsPath, notificationsMethods } from './notifications.shared.js'
import {disallow, iff} from "feathers-hooks-common";
import swagger from "feathers-swagger";
import {BadRequest} from "@feathersjs/errors";
import _ from "lodash";
import {shouldSendUserNotification} from "./commands/should-send-user-notification.js";

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
        schemaHooks.resolveResult(notificationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(notificationsQueryValidator),
        schemaHooks.resolveQuery(notificationsQueryResolver)
      ],
      find: [
        createIfMissingAndAllowed,
      ],
      get: [
        disallow(),  // to keep the Notifications document _id unique from userId, there is no real value in GET
      ],
      create: [
        disallow(),  // Do not "create" a Notifications document. They are auto-created on first FIND or PATCH.
      ],
      patch: [
       iff(
          context => context.data.shouldSendUserNotification,
          shouldSendUserNotification,
        ),
        schemaHooks.validateData(notificationsPatchValidator),
        schemaHooks.resolveData(notificationsPatchResolver)
      ],
      remove: [
        disallow('external'),
      ]
    },
    after: {
      all: [],
      find: [
      ],
    },
    error: {
      all: []
    }
  })
}


const createIfMissingAndAllowed = async context => {
  const userId = context.params.query?.userId || null;
  if (!userId) {
    return context;
  }
  const selfId = context.params.user._id;
  if (!_.isEqual(selfId, userId)) {
    console.log(`user ${selfId} attempted to read user ${userId} notifications`);
    throw new BadRequest('User does not have permission');
  }
  const notService = context.app.service('notifications');
  const notDb = await notService.options.Model;
  const result = await notDb.findOne({ 'userId': userId });
  if (!result) {
    // the document being searched for does not exist yet, create an empty one directly via DB
    const newDoc = await notDb.insertOne({
      userId: userId,
      notificationsReceived: [],
    })
  }
  return context;
}
