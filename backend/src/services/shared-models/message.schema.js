import { ObjectIdSchema, Type } from '@feathersjs/typebox';
import _ from 'lodash';

import { userSummarySchema } from '../users/users.subdocs.schema.js';

export const messageSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    createdBy: ObjectIdSchema(),
    text: Type.String(),
  },
)
