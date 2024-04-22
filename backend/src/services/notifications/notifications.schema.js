// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {userSummarySchema} from "../users/users.subdocs.schema.js";
import {organizationSummarySchema} from "../organizations/organizations.subdocs.schema.js";
import {notificationMessageType, specificDeliveryMethodType} from "./notifications.subdocs.js";
import {buildUserSummary} from "../users/users.distrib.js";
import {BadRequest} from "@feathersjs/errors";
import {buildOrganizationSummary} from "../organizations/organizations.distrib.js";
import _ from "lodash";

// Main data model schema
export const notificationsSchema = Type.Object(
  {
    // The "notifications" collection is, essentially, a log of notifications that have been generated.
    // The endpoint is also, however, teh means of sending those notifications intelligently.
    // The framework 'auth' service does NOT use this endpoint currently.
    _id: ObjectIdSchema(),
    to:  organizationSummarySchema, // TODO: if missing the _id field on CREATE, do lookup on 'refName'??
    from: organizationSummarySchema, // the org that the sender is representing
    createdBy: userSummarySchema,
    method: specificDeliveryMethodType,
    message: notificationMessageType,
    parameters: Type.Any(), // an open-ended mapping of parameters used by the delivery mechanism
  },
  { $id: 'Notifications', additionalProperties: false }
)
export const notificationsValidator = getValidator(notificationsSchema, dataValidator)
export const notificationsResolver = resolve({})

export const notificationsExternalResolver = resolve({})

// Schema for creating new entries
export const notificationsDataSchema = Type.Pick(notificationsSchema, ['to', 'message', 'parameters'], {
  $id: 'NotificationsData'
})
export const notificationsDataValidator = getValidator(notificationsDataSchema, dataValidator)
export const notificationsDataResolver = resolve({
  from: async (_value, message, context) => {
    const user = context.params.user;
    if (!user.currentOrganizationId) {
      throw new BadRequest("No organization selected to represent the source of the message.");
    }
    const userOrg = user.organizations.find((org) => _.isEqual(org._id, user.currentOrganizationId));
    if (!userOrg) {
      throw new BadRequest("Current organization not found in User document.");
    }
    return buildOrganizationSummary(userOrg);
  },
  createdBy: async (_value, message, context) => {
    return buildUserSummary(context.params.user);
  },
})

// Schema for updating existing entries
export const notificationsPatchSchema = Type.Partial(notificationsSchema, {
  $id: 'NotificationsPatch'
})
export const notificationsPatchValidator = getValidator(notificationsPatchSchema, dataValidator)
export const notificationsPatchResolver = resolve({})

// Schema for allowed query properties
export const notificationsQueryProperties = Type.Pick(notificationsSchema, ['_id', 'text'])
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
