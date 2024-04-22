import {StringEnum} from "@feathersjs/typebox";


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