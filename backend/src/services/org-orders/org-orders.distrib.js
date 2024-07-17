import {ObjectId} from "mongodb";

export const copyOrInsertOrgOrdersBeforePatch = async (context) => {
  // store a copy of the File in `context.beforePatchCopy` to help detect true changes
  const orgOrderService = context.app.service('org-orders');
  const orgId = new ObjectId(context.id);
  context.beforePatchCopy = await orgOrderService.get(orgId);
  if (!context.beforePatchCopy) {
    context.beforePatchCopy = await orgOrderService.create({
      _id: orgId,
    });
  }
  return context;
}
