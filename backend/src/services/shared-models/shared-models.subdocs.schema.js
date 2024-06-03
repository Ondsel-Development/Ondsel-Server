import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";


export const VersionFollowTypeMap = {
  locked: 'Locked',
  active: 'Active',
}

export const VersionFollowType = StringEnum(
  [
    VersionFollowTypeMap.locked,
    VersionFollowTypeMap.active,
  ]
)

export const fileDetailSchema = Type.Object(
  {
    fileId: ObjectIdSchema(),
    versionId: Type.Union([Type.Null(), ObjectIdSchema()]), // if versionFollow == 'Active' then this is null
  }
)
