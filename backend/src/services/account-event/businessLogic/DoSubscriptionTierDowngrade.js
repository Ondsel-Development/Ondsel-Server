import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionStateMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";

export async function DoSubscriptionTierDowngrade(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = SubscriptionTierDowngradeVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. this account event does NOT create a transaction.
  //    see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  //
  // 3. update the user doc
  //
  await context.app.service('users').patch(user._id, {
    nextTier: detail.newTier,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
}

function SubscriptionTierDowngradeVerification(context, user) {
  let result = {
    errMsg: "",
    desc: "",
    note: "",
    newTier: "",
  }
  //
  // new tier
  //
  result.newTier = context.data.detail.subscription;
  let currentTier = user.tier;
  if (context.data.detail.currentSubscription !== currentTier) {
    result.errMsg = `CALLER TO API BELIEVES THE CURRENT TIER IS ${context.data.detail.currentSubscription} BUT IT IS NOT`;
    return result;
  }
  // it is okay to "overwrite" the current planned downgrade with a new one. So, that is not checked here.
  if (result.newTier === currentTier) {
    // but if the "downgrade" takes you to the current tier, then set the newTier to null to stop the downgrade.
    result.newTier = null;
    result.note = String(context.data.note);
    result.desc = `DOWNGRADE CANCELLED; ACCOUNT WILL STAY AT ${currentTier}`;
    return result;
  }
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `DOWNGRADE TO ${result.newTier} FROM ${currentTier} ARRANGED FOR END OF PERIOD`;
  //
  // done
  //
  return result;
}
