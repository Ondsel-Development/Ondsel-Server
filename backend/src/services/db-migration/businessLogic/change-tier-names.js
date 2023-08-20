import {BadRequest} from "@feathersjs/errors";
import {SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";

export async function changeTierNames(context, PIN) {
  if (PIN !== '422232') {
    // A PIN code is not true form of security. It is mostly used prevent typos and accidents.
    // More important:
    //
    // 1. The code written must be safe to run multiple times and by a hacker. If this isn't true, then
    //    a different form of migration should be used.
    // 2. The code must be commented out in a later release after all migrations are completed. It isn't
    //    deleted since a historical record might be valuable. But there is no reason to keep it active.
    // 3. Errors should be handled with a thrown error so that a document is not stored; which would
    //    block future retries.
    throw new BadRequest("Wrong PIN used.");
  };
  //
  // yes, the following could be done with a "generic patch", but I want to see a log in the resultMsg
  // at this point in time. Fortunately, there are not that many user documents.
  //
  const userService = context.app.service('users');
  let resultMsg = ' | Free: ';
  const freeTierUsers = await getAllUsersNeedingChange(userService, SubscriptionTypeMap.free);
  let userChange;
  for (userChange of freeTierUsers) {
    resultMsg += await fixUser(userService, userChange, SubscriptionTypeMap.solo);
  }
  resultMsg += `(${freeTierUsers.length} done);`;

  resultMsg += ' | Premium: ';
  const premiumTierUsers = await getAllUsersNeedingChange(userService, SubscriptionTypeMap.premium);
  for (userChange of premiumTierUsers) {
    resultMsg += await fixUser(userService, userChange, SubscriptionTypeMap.peer);
  }
  resultMsg += `(${premiumTierUsers.length} done);`;

  context.data.resultMsg = 'SUCCESS' + resultMsg;
}

async function getAllUsersNeedingChange(userService, tier){
  const result = await userService.find({
    query: {
      $limit: 1000, // at this stage, this is overkill
      $skip: 0,
      $sort: {
        _id: -1,
      },
      tier: tier
    }
  });
  return result.data;
}

async function fixUser(userService, userChange, newTier){
  const result = await userService.patch(
    userChange._id,
    {
      tier: newTier
    }
  );
  return `(${result.email}),`;
}
