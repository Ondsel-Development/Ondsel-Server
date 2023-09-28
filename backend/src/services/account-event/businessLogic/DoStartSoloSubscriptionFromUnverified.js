import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";


export async function DoStartSoloSubscriptionFromUnverified(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = SoloStartVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);
  let balanceMsg = verifyBalanced(transaction); // it is empty, so of course it will balance
  if (balanceMsg !== "") {
    context.data.resultMsg = balanceMsg;
    return;
  }
  addTransactionToUserAndSummarize(user, transaction);
  //
  // 3. update the user doc
  //
  await context.app.service('users').patch(user._id, {
    nextTier: detail.newTier,
    userAccounting: user.userAccounting,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
}

function SoloStartVerification(context, user) {
  let result = {
    errMsg: "",
    desc: "",
    note: "",
    newTier: "",
  }
  //
  // starting with unverified
  //
  if (user.tier !== SubscriptionTypeMap.unverified) {
    result.errMsg = 'This account function only works when starting from unverified.';
    return result;
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
  if (result.newTier !== SubscriptionTypeMap.solo) {
    result.errMsg = 'This account function only works when going to solo.';
  }
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `ACCOUNT VERIFIED AND AUTOMATICALLY UPGRADED TO FREE ${result.newTier} TIER FROM ${currentTier}`;
  //
  // done
  //
  return result;
}
