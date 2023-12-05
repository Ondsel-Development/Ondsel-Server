import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { fileVersionSchema } from './file.schema.js'

export const fileSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    custFileName: Type.Optional(Type.String()),
    modelId: Type.Optional(ObjectIdSchema()),
    currentVersion: fileVersionSchema,
    thumbnailUrlCache: Type.Optional(Type.String()),
  }
)
