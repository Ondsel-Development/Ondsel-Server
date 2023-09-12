import {StringEnum, Type} from "@feathersjs/typebox";

// This schema is strictly a courtesy for the Swagger page; this is never stored anywhere or used anywhere else.

export const authManagementActionType = StringEnum(
  [
    'resendVerifySignup',
    'verifySignup',
    'verifySignupSetPassword',
    'sendResetPwd',
    'resetPwd',
    'passwordChange',
    'identityChange',
  ]
)

export const authManagementSchema = Type.Object(
  {
    action: authManagementActionType,
    value: Type.Object(Type.Any()),
    notifierOptions: Type.Optional(Type.Object(Type.Any())),
  },
  { $id: 'AuthManagement', additionalProperties: false }
)
