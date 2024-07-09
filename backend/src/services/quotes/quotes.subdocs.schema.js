import {StringEnum} from "@feathersjs/typebox";

export const ThirdPartyVendorTypeMap = {
  slant3D: 'Slant 3D'
}

export const ThirdPartyVendorType = StringEnum(
  [
    ThirdPartyVendorTypeMap.slant3D,
  ]
)
