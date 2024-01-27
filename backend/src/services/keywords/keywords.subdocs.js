import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {organizationSummarySchema} from "../organizations/organizations.subdocs.schema.js";
import {workspaceSummary} from "../workspaces/workspaces.subdocs.schema.js";
import {userSummarySchema} from "../users/users.subdocs.schema.js";

export const keywordMatchSchema = Type.Object(
  {
    score: Type.Integer(),
    id: ObjectIdSchema(),
    collection: Type.String(),
    summary: Type.Union([userSummarySchema, organizationSummarySchema, workspaceSummary]),
  }
)

