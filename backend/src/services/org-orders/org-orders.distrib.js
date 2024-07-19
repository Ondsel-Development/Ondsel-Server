import {ObjectId} from "mongodb";

export const copyOrInsertOrgOrdersBeforePatch = async (context) => {
  // basically, support "upsert"
  const orgOrderService = context.app.service('org-orders');
  const orgOrdersDb = await orgOrderService.options.Model;
  const orgId = new ObjectId(context.id);

  let ooCopy = await orgOrdersDb.findOne({ _id: orgId });
  if (!ooCopy) {
    const orgService = context.app.service('organizations');
    const refOrg = await orgService.get(orgId);
    if (!refOrg) {
      console.log(`Somebody tried to get a org-order for an organization that does not exist (${orgId})`);
    } else {
      ooCopy = await orgOrderService.create({
        _id: orgId,
      });
    }
  }
  if (ooCopy) {
    switch (context.method) {
      case 'patch':
        context.beforePatchCopy = ooCopy;
        break;
      case 'get':
        context.result = ooCopy; // we are done.
        break;
    }
  }
  return context;
}
