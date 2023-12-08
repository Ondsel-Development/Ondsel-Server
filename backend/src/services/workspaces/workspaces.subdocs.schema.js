import { ObjectIdSchema, Type } from '@feathersjs/typebox';

export const workspaceSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    refName: Type.String(),
  }
)
