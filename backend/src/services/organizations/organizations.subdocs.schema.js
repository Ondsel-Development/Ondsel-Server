import {StringEnum, Type} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

// Main data model schema
export const OrganizationTypeMap = {
  personal: 'Personal',
  open: 'Open',
  private: 'Private',
  ondsel: 'Ondsel',
}

export const OrganizationType = StringEnum([
  OrganizationTypeMap.personal,
  OrganizationTypeMap.open,
  OrganizationTypeMap.private,
  OrganizationTypeMap.ondsel,
])

export const organizationSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    refName: Type.String(),
    type: Type.Optional(OrganizationType),
  }
)

