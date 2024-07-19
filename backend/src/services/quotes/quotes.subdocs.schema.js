import {StringEnum} from "@feathersjs/typebox";

export const ThirdPartyVendorTypeMap = {
  slant3D: 'Slant 3D'
}

export const QUOTE_LIFESPAN = {
  'Slant 3D': 30*24*60*60 // 30 days in seconds
}

export const ThirdPartyVendorType = StringEnum(
  [
    ThirdPartyVendorTypeMap.slant3D,
  ]
)
