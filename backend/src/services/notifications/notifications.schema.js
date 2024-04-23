// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import {resolve, virtual} from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {
  notificationsEntrySchema,
} from "./notifications.subdocs.js";

// Main data model schema
export const notificationsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    // TODO: should we add notificationsSent for logging?
    notificationsReceived: Type.Array(notificationsEntrySchema),
  },
  { $id: 'Notifications', additionalProperties: false }
)
export const notificationsValidator = getValidator(notificationsSchema, dataValidator)
export const notificationsResolver = resolve({})

export const notificationsExternalResolver = resolve({
  readNotifications: virtual(async(message, _context) => {
    const readNotifications = message.notificationsReceived.filter((entry) => entry.read === true);
    return readNotifications;
  }),
  unreadNotifications: virtual(async(message, _context) => {
    const unreadNotifications = message.notificationsReceived.filter((entry) => entry.read === false);
    return unreadNotifications;
  }),
})

// Schema for creating new entries
export const notificationsDataSchema = Type.Pick(notificationsSchema, [], {
  $id: 'NotificationsData'
})
export const notificationsDataValidator = getValidator(notificationsDataSchema, dataValidator)
export const notificationsDataResolver = resolve({
})

// Schema for updating existing entries
export const notificationsPatchSchema = Type.Partial(notificationsSchema, {
  $id: 'NotificationsPatch'
})
export const notificationsPatchValidator = getValidator(notificationsPatchSchema, dataValidator)
export const notificationsPatchResolver = resolve({})

// Schema for allowed query properties
export const notificationsQueryProperties = Type.Pick(notificationsSchema, ['_id', 'userId'])
export const notificationsQuerySchema = Type.Intersect(
  [
    querySyntax(notificationsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const notificationsQueryValidator = getValidator(notificationsQuerySchema, queryValidator)
export const notificationsQueryResolver = resolve({})
