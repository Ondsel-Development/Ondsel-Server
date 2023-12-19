import {StringEnum, Type} from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

// Main data model schema
export const organizationSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    refName: Type.String(),
  }
)

export const OrganizationTypeMap = {
  personal: 'Personal',
  private: 'Private',
}

export const OrganizationType = StringEnum([
  OrganizationTypeMap.personal,
  OrganizationTypeMap.private
])
