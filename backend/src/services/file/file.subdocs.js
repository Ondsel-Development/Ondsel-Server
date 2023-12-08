import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { fileVersionSchema } from './file.schema.js'
import {SubscriptionType} from "../users/users.subdocs.schema.js";

export const fileSummary = Type.Object(
  {
    _id: ObjectIdSchema(),
    custFileName: Type.Optional(Type.String()),
    modelId: Type.Optional(Type.Union([Type.Null(), ObjectIdSchema()])),
    currentVersion: fileVersionSchema,
    thumbnailUrlCache: Type.Union([Type.Null(), Type.String()]),
  }
)
