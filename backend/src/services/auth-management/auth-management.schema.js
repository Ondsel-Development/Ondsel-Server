import {StringEnum, Type} from "@feathersjs/typebox";

// This schema is strictly a courtesy for the Swagger page; this is never stored anywhere or used anywhere else.


export const authManagementActionTypeMap = {
  resendVerifySignup: 'resendVerifySignup',
  verifySignupLong: 'verifySignupLong',
  // verifySignupShort: 'verifySignupShort',
  // 'verifySignupSetPassword',
  // 'sendResetPwd',
  // 'resetPwd',
  // 'passwordChange',
  // 'identityChange',
}

export const authManagementActionType = StringEnum(
  [
    authManagementActionTypeMap.resendVerifySignup,
    authManagementActionTypeMap.verifySignupLong,
    // authManagementActionTypeMap.verifySignupShort,
    // 'verifySignupSetPassword',
    // 'sendResetPwd',
    // 'resetPwd',
    // 'passwordChange',
    // 'identityChange',
  ]
)

export const authManagementSchema = Type.Object(
  {
    action: authManagementActionType,
    value: Type.String(),
    notifierOptions: Type.Optional(Type.Object(Type.Any())),
  },
  { $id: 'AuthManagement', additionalProperties: false }
)
