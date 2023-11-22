import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";


export const orgInviteStateTypeMap = {
  sendOrgInviteEmail: 'sendOrgInviteEmail',
  verifyOrgInviteEmail: 'verifyOrgInviteEmail',
  cancelOrgInvite: 'cancelOrgInvite',
}

export const orgInviteStateType = StringEnum(
  [
    orgInviteStateTypeMap.sendOrgInviteEmail,
    orgInviteStateTypeMap.verifyOrgInviteEmail,
    orgInviteStateTypeMap.cancelOrgInvite,
]);

export const orgInvitesResultSchema = Type.Object(
  {
    userId: Type.Optional(ObjectIdSchema()), // on acceptance, this is the user who accepted
    handledAt: Type.Optional(Type.Number()), // Date/Time
    note: Type.Optional(Type.String()),
    log: Type.Optional(Type.String()),
    cancelledByUserId: Type.Optional(ObjectIdSchema()), // set by org member who cancelled it (if cancelled)
  }
)
