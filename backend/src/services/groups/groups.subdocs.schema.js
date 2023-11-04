import { ObjectIdSchema, Type } from '@feathersjs/typebox';

export const groupSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String()
  }
)
