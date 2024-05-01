import { ObjectIdSchema, StringEnum, Type } from '@feathersjs/typebox';
import { modelSummarySchema } from '../models/models.distrib.js';
import { sharedModelsSummarySchema } from '../shared-models/shared-models.distrib.js';
import { workspaceSummary } from '../workspaces/workspaces.subdocs.schema.js';
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import {curationSchema, navRefSchema} from "../../curation.schema.js";
import {organizationSummarySchema} from "../organizations/organizations.subdocs.schema.js";
import {organizationPath} from "../organizations/organizations.shared.js";


export const CollectionNameMap = {
  users: 'users',
  organizations: organizationPath,
  workspaces: 'workspaces',
  models: 'models',
  'shared-models': 'shared-models',
};


export const bookmarkSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    createdBy: userSummarySchema,
    onBehalfOf: Type.Optional(organizationSummarySchema), // used by SharedWithMe
    description: Type.String(),
    read: Type.Optional(Type.Boolean()),
    collectionName: StringEnum(Object.values(CollectionNameMap)),
    collectionSummary: Type.Union([
      modelSummarySchema,
      sharedModelsSummarySchema,
      workspaceSummary,
      userSummarySchema,
    ]),
    curation: Type.Optional(curationSchema), // this includes the `nav` with URL-building details
  }
);
