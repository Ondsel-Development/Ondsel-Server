import {ObjectIdSchema, Type} from "@feathersjs/typebox";

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


export const copySharedModelBeforePatch = async (context) => {
    // store a copy of the Org in `context.beforePatchCopy` to help detect true changes
    const smService = context.app.service('shared-models');
    const smId = context.id;
    context.beforePatchCopy = await smService.get(smId);
    return context;
}
