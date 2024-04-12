import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import _ from 'lodash';

export const sharedModelsSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
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


export function buildSharedModelSummary(sharedModel) {
    let summary = {};
    if (sharedModel) {
        summary = _.pick(sharedModel, [
          '_id', 'isThumbnailGenerated', 'thumbnailUrl'
        ])
    }
    return summary;
}
