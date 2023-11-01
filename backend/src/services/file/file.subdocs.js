import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

export const fileSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    custFileName: Type.String(),
    modelId: Type.Optional(ObjectIdSchema()),
  }
)
