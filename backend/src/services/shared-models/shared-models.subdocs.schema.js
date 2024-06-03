import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";


export const RevisionFollowTypeMap = {
  locked: 'Locked',
  active: 'Active',
}

export const RevisionFollowType = StringEnum(
  [
    RevisionFollowTypeMap.locked,
    RevisionFollowTypeMap.active,
  ]
)

export const fileDetailSchema = Type.Object(
  {
    fileId: ObjectIdSchema(),
    revisionId: Type.Union([Type.Null(), ObjectIdSchema()]), // if revisionFollow == 'Active' then this is null
  }
)
