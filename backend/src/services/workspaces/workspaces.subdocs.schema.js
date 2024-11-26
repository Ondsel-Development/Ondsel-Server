// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {ObjectIdSchema, StringEnum, Type} from '@feathersjs/typebox';

export const workspaceSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    refName: Type.String(),
    open: Type.Boolean(),
  }
)

export const LicenseTypeMap = {
  cc0: 'CC0 1.0',
  ccBy: 'CC BY 4.0',
  ccBySa: 'CC BY-SA 4.0',
  arr: 'All Rights Reserved',  // no license given; making available via Ondsel for public display
}

export const LicenseType = StringEnum([
  LicenseTypeMap.cc0,
  LicenseTypeMap.ccBy,
  LicenseTypeMap.ccBySa,
  LicenseTypeMap.arr,
])
