import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {modelSchema} from "../models/models.schema.js";
import {modelSummarySchema} from "../models/models.distrib.js";

export const sharedModelsSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: Type.String({ objectid: true }),
    modelId: ObjectIdSchema(),
    fileId: ObjectIdSchema(),
    workspaceId: ObjectIdSchema(),
    description: Type.String({ maxLength: 20 }),
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.String(),
  },
)
