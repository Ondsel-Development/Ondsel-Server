import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { userSummarySchema } from '../users/users.subdocs.schema.js';

export const preferenceVersionDataEntrySchema = Type.Object(
  {
    key: Type.String(),
    type: Type.String(),
    value: Type.Boolean(),
  }
)

export const preferenceFileVersionSchema = Type.Object(
  {
    fileName: Type.String(),
    uniqueFileName: Type.String(),
    data: Type.Array(preferenceVersionDataEntrySchema),
    additionalData: Type.Object({}),
  }
)

export const preferenceVersionSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdBy: userSummarySchema,
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    files: Type.Array(preferenceFileVersionSchema)
  }
)
