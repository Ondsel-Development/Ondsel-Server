import {
  AccountEventType,
  AccountEventTypeMap,
} from "../services/account-event/account-event.schema.js";
import {ObjectId} from "mongodb";

export const performAccountEventLogic = (context) => {
  switch(context.data.event) {
    case AccountEventTypeMap.initialSubscriptionPurchase:
      DoInitialSubscriptionPurchase(context);
      break;
    default:
      context.data.resultMsg = "Business logic for event type not supported yet.";
      break;
  }
  return context;
}

function DoInitialSubscriptionPurchase(context) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let amt = context.data.amount;
  if (amt === undefined || amt == null ) {
    context.data.resultMsg = "Amount must be set to an integer (in pennies) for this event type.";
    return;
  }
  if (amt != Math.round(amt)) {
    context.data.resultMsg = "Amount must be a simple integer measuring pennies (100ths of USD), not a float, for this event type.";
    return;
  };
  if (amt <= 1) {
    context.data.resultMsg = "Amount must be a positive non-zero integer (in pennies) for this event type.";
    return;
  }
  if (amt > 100000) {
    context.data.resultMsg = "Amount must be a below 100000 (1000.00 USD) to be valid.";
    return;
  }
  if (context.data.detail === undefined ) {
    context.data.resultMsg = "Detail required for this event type.";
    return;
  }
  if (context.data.detail.subscription === undefined || context.data.detail.subscription == null) {
    context.data.resultMsg = "Detail.subscription required for this event type.";
    return;
  }
  if (context.data.detail.subscription === undefined || context.data.detail.subscription == null) {
    context.data.resultMsg = "Detail.subscription required for this event type.";
    return;
  }
  let subscription = context.data.detail.subscription;
  if (!Object.values(SubscriptionTypeMap).includes(subscription)) {
    context.data.resultMsg = "Invalid Detail.subscription.";
    return;
  }
  if (subscription === SubscriptionTypeMap.free) {
    context.data.resultMsg = "You cannot subscribe to `free` in exchange for money."; // this might change later w 0 amt
    return;
  }

  //
  // 2. get the user document
  //
  let tierChange = false;

  //
  // 3. calculate the proper journal entries, summarize, optional tier
  //

  //
  // 4. update the user doc
  //

  //
  // all is good; return message
  //
  context.data.success = true;
  if (tierChange) {
    context.data.resultMsg = "Completed user update with journal entries and changed tier to "; // + user.tier + ".";
  } else {
    context.data.resultMsg = "Completed user update with journal entries.";
  }
}
