import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";
import { sendNotificationToSlack } from '../../../slack-notifications.js';


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
  // 2. see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);
  // debit(transaction, LedgerMap.cash, 0);
  // credit(transaction, LedgerMap.unearnedRevenue, 0);
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
  await sendNotificationToSlack(
    context,
    `🎉 Subscription downgrade Alert! 🎉\n\nUser (user: *${user.name}*, email: *${user.email}*) user downgrade tier from *${user.tier}* to *${detail.newTier}*`
  )
}

function SubscriptionTierDowngradeVerification(context, user) {
  let result = {
    errMsg: "",
    desc: "",
    note: "",
    newTier: "",
  }
  if (user.tier === SubscriptionTypeMap.unverified) {
    result.errMsg = 'UNVERIFIED USERS CANNOT CHANGE TIERS. It doesn\'t even make sense here.';
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
