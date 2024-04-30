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
import {disallow, iff, isProvider, preventChanges} from "feathers-hooks-common";
import swagger from "feathers-swagger";
import {BadRequest} from "@feathersjs/errors";
import _ from "lodash";
import {shouldSendUserNotification} from "./commands/should-send-user-notification.js";
import {copyBeforePatch} from "../../helpers.js";
import {shouldMarkReadOrUnread} from "./commands/should-mark-read-or-unread.js";
import {isAdminUser} from "../../hooks/is-user.js";
import {shouldDelete} from "./commands/should-delete.js";
import {validateNavObject} from "../../curation.schema.js";

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
        disallow(),
      ],
      get: [],
      create: [
        disallow('external'), // creation occurs during user creation or migration script
      ],
      patch: [
        copyBeforePatch,
        isProperUser,
        iff(isProvider('external'), preventChanges(false, 'userId', 'notificationsReceived')),
        iff(
          context => context.data.shouldSendUserNotification,
          [
            validateNavObject('messageDetail.nav', false),
            shouldSendUserNotification,
          ]
        ),
        iff(
          context => context.data.shouldMarkReadOrUnread,
          shouldMarkReadOrUnread,
        ),
        iff(
          context => context.data.shouldDelete,
          shouldDelete,
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
      get: [
        wasProperUser,
      ],
    },
    error: {
      all: []
    }
  })
}

const isProperUser = async (context) => {
  const provider = context.params.provider; // Internal calls are "undefined"
  if (provider === undefined) {
    return context;
  }
  if (!_.isEqual(context.beforePatchCopy.userId, context.params.user._id)) {
    throw new BadRequest(`User ${context.params.user._id} does not have permission to patch ${context.id}`);
  }
}

const wasProperUser = async (context) => {
  const provider = context.params.provider; // Internal calls are "undefined"
  if (provider === undefined) {
    return context;
  }
  if (!_.isEqual(context.result.userId, context.params.user._id)) {
    throw new BadRequest(`User ${context.params.user._id} does not have permission to patch ${context.id}`);
  }
}
