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
  let userChange;
  let resultMsg = '';
  const allUsers = await getAllUsers(userService);
  for (userChange of allUsers) {
    resultMsg += await fixUser(userService, userChange);
  }

  context.data.resultMsg = 'SUCCESS' + resultMsg;
}

async function getAllUsers(userService){
  const result = await userService.find({
    query: {
      $limit: 1000, // at this stage, this is overkill
      $skip: 0,
      $sort: {
        _id: -1,
      },
    }
  });
  return result.data;
}

async function fixUser(userService, userChange){
  let resultMsg = '';
  let newTier = null;
  switch (userChange.tier)
  {
    case SubscriptionTypeMap.free:
      newTier = SubscriptionTypeMap.solo;
      break;
    case SubscriptionTypeMap.premium:
      newTier = SubscriptionTypeMap.peer;
      break;
    case SubscriptionTypeMap.enterprise:
    case SubscriptionTypeMap.peer:
      // do nothing
      break;
    default: // "missing" appears as "solo"; so both solo and missing are set to solo
      newTier = SubscriptionTypeMap.solo;
      break;
  }
  if (newTier !== null) {
    const result = await userService.patch(
      userChange._id,
      {
        tier: newTier
      }
    );
    resultMsg = ` ${userChange.email}(${userChange.tier}>${result.tier})`;
  }
  return resultMsg;
}
