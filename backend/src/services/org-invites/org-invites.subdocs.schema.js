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
    userId: ObjectIdSchema(), // on acceptance, this is the user who accepted
    handledAt: Type.Number(), // Date/Time
    note: Type.String(),
    cancelledByUserId: ObjectIdSchema(), // set by org member who cancelled it (if cancelled)
  }
)
