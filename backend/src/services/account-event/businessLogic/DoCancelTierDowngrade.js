import {addTransactionToUserAndSummarize, makeEmptyJournalTransaction, verifyBalanced} from "../../../accounting.js";
import {SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";
import { sendNotificationToSlack } from '../../../slack-notifications.js';


export async function DoCancelTierDowngrade(context, user) {
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
  // no credits or debits as this action does not change anything financially (yet) but needs to be recorded for user history
  let balanceMsg = verifyBalanced(transaction); // it is empty, so of course it will balance
  if (balanceMsg !== "") {
    context.data.resultMsg = balanceMsg;
    return;
  }
  addTransactionToUserAndSummarize(user, transaction);
  //
  // 3. update the user doc
  //
  user.subscriptionDetail.term = detail.newTerm;
  await context.app.service('users').patch(user._id, {
    nextTier: null,
    subscriptionDetail: user.subscriptionDetail,
    userAccounting: user.userAccounting,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
  await sendNotificationToSlack(
    context,
    `🎉 Cancel Tier Downgrade request! 🎉\n\nUser (name: *${user.name}*, email: *${user.email}*) user just cancel tier downgrade request!\nPlan: *${user.tier}*`
  )
}

function SubscriptionTierDowngradeVerification(context, user) {
  let result = {
    errMsg: "",
    desc: "",
    note: "",
    newTerm: "",
  }
  //
  // new tier
  //
  let currentTier = user.tier;
  if (currentTier === SubscriptionTypeMap.unverified) {
    result.errMsg = 'UNVERIFIED USERS CANNOT CHANGE TIERS';
    return result;
  }
  if (context.data.detail.currentSubscription !== currentTier) {
    result.errMsg = `CALLER TO API BELIEVES THE CURRENT TIER IS ${context.data.detail.currentSubscription} BUT IT IS NOT`;
    return result;
  }
  if (context.data.subscription === null) {
    result.errMsg = `YOU CANNOT CANCEL TO NULL`
    return result;
  }
  //
  // restored term
  //
  result.newTerm = context.data.detail.term;
  if (result.newTerm === undefined || result.newTerm === null) {
    result.errMsg = `THE PREVIOUS TERM MUST BE SUPPLIED`; // TODO: make this more elegant
    return result;
  }
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `CANCELLING DOWNGRADE TO ${user.nextTier}; NOW IS ${currentTier} AGAIN`;
  //
  // done
  //
  return result;
}
