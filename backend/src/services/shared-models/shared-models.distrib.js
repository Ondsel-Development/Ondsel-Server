import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import _ from 'lodash';

export const sharedModelsSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.String(),
    custFileName: Type.String(),
    createdAt: Type.Number(),
  },
)


export const copySharedModelBeforePatch = async (context) => {
    // store a copy of the Org in `context.beforePatchCopy` to help detect true changes
    const smService = context.app.service('shared-models');
    const smId = context.id;
    context.beforePatchCopy = await smService.get(smId);
    return context;
}


export function buildSharedModelSummary(sharedModel) {
    let summary = {};
    if (sharedModel) {
      summary = {
        _id: sharedModel._id,
        custFileName: sharedModel.model?.file?.custFileName || '',
        isThumbnailGenerated: sharedModel.isThumbnailGenerated,
        thumbnailUrl: sharedModel.thumbnailUrl,
        createdAt: sharedModel.createdAt,
      };
    }
    return summary;
}
