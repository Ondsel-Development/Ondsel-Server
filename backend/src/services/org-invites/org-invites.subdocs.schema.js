import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";

export const InviteNatureTypeMap = {
  email: 'email',
}

export const InviteNatureType = StringEnum(
  [
    InviteNatureTypeMap.email,
  ]
)

export const orgInvitesResultSchema = Type.Object(
  {
    userId: ObjectIdSchema(),
    acceptedAt: Type.Number(), // Date/Time
    note: Type.String(),
  }
)
