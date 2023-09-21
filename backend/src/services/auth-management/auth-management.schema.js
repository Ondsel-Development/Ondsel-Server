import {StringEnum, Type} from "@feathersjs/typebox";

// This schema is strictly a courtesy for the Swagger page; this is never stored anywhere or used anywhere else.


export const authManagementActionTypeMap = {
  resendVerifySignup: 'resendVerifySignup',
  verifySignupLong: 'verifySignupLong',
  sendResetPwd: 'sendResetPwd',
  resetPwdLong: 'resetPwdLong',
}
export const resetPwdGENERIC = 'resetPwd';

export const authManagementActionType = StringEnum(
  [
    authManagementActionTypeMap.resendVerifySignup,
    authManagementActionTypeMap.verifySignupLong,
    authManagementActionTypeMap.sendResetPwd,
    authManagementActionTypeMap.resetPwdLong,
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
