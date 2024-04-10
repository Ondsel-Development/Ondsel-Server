import { ObjectIdSchema, StringEnum, Type } from '@feathersjs/typebox';
import { modelSummarySchema } from '../models/models.distrib.js';
import { sharedModelsSummarySchema } from '../shared-models/shared-models.distrib.js';
import { workspaceSummary } from '../workspaces/workspaces.subdocs.schema.js';
import { userSummarySchema } from '../users/users.subdocs.schema.js';


export const CollectionNameMap = {
  users: 'users',
  workspaces: 'workspaces',
  models: 'models',
  sharedModels: 'shared-models',
};


export const bookmarkSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    createdBy: userSummarySchema,
    description: Type.String(),
    collection: StringEnum([
      CollectionNameMap.models,
      CollectionNameMap.sharedModels,
      CollectionNameMap.workspaces,
      CollectionNameMap.users,
    ]),
    summary: Type.Union([
      modelSummarySchema,
      sharedModelsSummarySchema,
      workspaceSummary,
      userSummarySchema,
    ]),
  }
);
