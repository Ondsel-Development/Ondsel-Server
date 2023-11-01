// update tier names

import {SubscriptionTypeMap} from "../services/users/users.subdocs.schema.js";

export async function updateTierNames(app) {

  const userService = app.service('users');

  console.log(">>> getting users list");
  const userList = await userService.find({
    paginate: false,
  });
  console.log(`>>>   found ${userList.length} entries`)

  console.log(">>> examining each user");
  for (const userToChange of userList) {
    await fixUser(userService, userToChange);
  }
}

async function fixUser(userService, userChange){
  let newTier = null;
  switch (userChange.tier)
  {
    // case SubscriptionTypeMap.free:
    //   newTier = SubscriptionTypeMap.solo;
    //   break;
    // case SubscriptionTypeMap.premium:
    //   newTier = SubscriptionTypeMap.peer;
    //   break;
    case SubscriptionTypeMap.enterprise:
    case SubscriptionTypeMap.peer:
      // do nothing
      break;
    default: // "missing" appears as "solo"; so both solo and missing are set to solo
      newTier = SubscriptionTypeMap.unverified;
      break;
  }
  if (newTier !== null) {
    const result = await userService.patch(
      userChange._id,
      {
        tier: newTier
      }
    );
    if (userChange.tier === SubscriptionTypeMap.solo) {
      console.log(`>>>   ${userChange.email}: preemptively confirming ${result.tier}`);
    } else {
      console.log(`>>>   ${userChange.email}: ${userChange.tier} -> ${result.tier}`);
    }
  } else {
    console.log(`>>>   ${userChange.email}: nothing to do`);
  }
}
