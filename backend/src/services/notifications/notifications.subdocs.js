import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";
import {organizationSummarySchema} from "../organizations/organizations.subdocs.schema.js";
import {userSummarySchema} from "../users/users.subdocs.schema.js";

export const specificDeliveryMethodMap = {
  mailchimpSMTP: 'mailchimp SMTP',
  mailchimpEmailAPI: 'mailchimp email API',
  mailchimpSmsAPI: 'mailchimp SMS API',
}

export const specificDeliveryMethodType = StringEnum(
  [
    specificDeliveryMethodMap.mailchimpSMTP,
    specificDeliveryMethodMap.mailchimpEmailAPI,
    specificDeliveryMethodMap.mailchimpSmsAPI,
  ]
)

export const notificationMessageMap = {
  resendVerifySignup: 'resendVerifySignup', // these first four are from auth system plugin
  verifySignupLong: 'verifySignupLong',
  sendResetPwd: 'sendResetPwd',
  resetPwdLong: 'resetPwdLong',
  itemShared: 'itemShared',
}

export const notificationMessageType = StringEnum(
  [
    notificationMessageMap.resendVerifySignup,
    notificationMessageMap.verifySignupLong,
    notificationMessageMap.sendResetPwd,
    notificationMessageMap.resetPwdLong,
    notificationMessageMap.itemShared,
  ]
)

export const notificationsEntrySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    read: Type.Boolean(),
    to: ObjectIdSchema(),
    from: organizationSummarySchema, // the org that the sender is representing
    createdBy: userSummarySchema,
    when: Type.Number(),
    method: specificDeliveryMethodType,
    message: notificationMessageType,
    bodySummaryTxt: Type.String(),
    parameters: Type.Any(), // an open-ended mapping of parameters used by the delivery mechanism
  }
)
