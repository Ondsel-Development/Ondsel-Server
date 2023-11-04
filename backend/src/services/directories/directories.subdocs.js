import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

export const directorySummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
  }
)
