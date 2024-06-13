import { StringEnum } from '@feathersjs/typebox';

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
