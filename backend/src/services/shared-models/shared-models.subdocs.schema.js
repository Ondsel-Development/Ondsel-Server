// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ObjectIdSchema, StringEnum, Type} from "@feathersjs/typebox";

export const ProtectionTypeMap = {
  listed: 'Listed',
  unlisted: 'Unlisted',
  pin: 'Pin',
  direct: 'Direct',
}

export const ProtectionType = StringEnum(
  [
    ProtectionTypeMap.listed,
    ProtectionTypeMap.unlisted,
    ProtectionTypeMap.pin,
    ProtectionTypeMap.direct
  ]
)

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
