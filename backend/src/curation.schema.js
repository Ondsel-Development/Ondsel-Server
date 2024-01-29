import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {fileSummary} from "./services/file/file.subdocs.js";
import {workspaceSummary} from "./services/workspaces/workspaces.subdocs.schema.js";
import {sharedModelsSummarySchema} from "./services/shared-models/shared-models.distrib.js";

// this schema is shared by users, organizations, and workspaces (and possibly others)
// But, this is NOT a collection, so it is placed here as a shared item with a suite
// of support functions.

export const curationSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    collection: Type.String(),
    name: Type.String(), // limited to 40 runes (unicode code points aka characters)
    description: Type.String(), // limited to 80 runes
    longDescriptionMd: Type.String(), // markdown expected
    tags: Type.Array(Type.String()), // list of zero or more lower-case strings
    representativeFile: Type.Union([Type.Null(), fileSummary]), // if applicable
    promotedWorkspaces: Type.Array(workspaceSummary),
    promotedSharedModels: Type.Array(sharedModelsSummarySchema),
    keywordRefs: Type.Array(Type.String()), // used for pre-emptive "cleanup" prior to recalculating keywords
  }
)
