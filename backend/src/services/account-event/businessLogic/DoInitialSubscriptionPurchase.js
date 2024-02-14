import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionStateMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";
import { sendNotificationToSlack } from '../../../slack-notifications.js';

export async function DoInitialSubscriptionPurchase(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = InitialSubscriptionPurchaseVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. calculate the proper journal entries, summarize, optional tier
  //    see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);
  debit(transaction, LedgerMap.cash, detail.amt, detail.originalCurrency, detail.originalAmt);
  credit(transaction, LedgerMap.unearnedRevenue, detail.amt);
  let balanceMsg = verifyBalanced(transaction);
  if (balanceMsg !== "") {
    context.data.resultMsg = balanceMsg;
    return;
  }
  addTransactionToUserAndSummarize(user, transaction);
  //
  // 3. update the user doc
  //
  context.data.transactionId = transaction.transactionId; // this is VERY important; otherwise we can't match the logs to the user journal entries
  user.subscriptionDetail.state = detail.newSubscriptionState;
  user.subscriptionDetail.term = context.data.detail.term;
  user.subscriptionDetail.anniversary = Date.now();
  await context.app.service('users').patch(user._id, {
    tier: detail.newTier,
    userAccounting: user.userAccounting,
    subscriptionDetail: user.subscriptionDetail,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
  await sendNotificationToSlack(
    context,
    `🎉 New Paid Customer Alert! 🎉\n\nUser (name: *${user.name}*, email: *${user.email}*) user just upgraded to a paid plan!\nPlan: *${detail.newTier}*`
  )
}

function InitialSubscriptionPurchaseVerification(context, user) {
  let result = {
    errMsg: "",
    amt: 0,
    newTier: "",
    newSubscriptionState: "",
    desc: "",
    note: "",
    originalCurrency: "",
    originalAmt: "",
  }
  //
  // amount checks
  //
  let amt = context.data.amount;
  if (amt === undefined || amt == null ) {
    result.errMsg = "Amount must be set to an integer (in pennies) for this event type.";
    return result;
  }
  if (amt !== Math.round(amt)) {
    result.errMsg = "Amount must be a simple integer measuring pennies (100ths of USD), not a float, for this event type.";
    return result;
  }
  if (amt <= 1) {
    result.errMsg = "Amount must be a positive non-zero integer (in pennies) for this event type.";
    return result;
  }
  if (amt > 100000) {
    result.errMsg = "Amount must be a below 100000 (1000.00 USD) to be valid.";
    return result;
  }
  result.amt = amt;
  //
  // transaction data for original currency
  //
  if (context.data.originalAmt === undefined || context.data.originalAmt == null ) {
    result.errMsg = "Original amount in the original currency must be specified. For USD, express this as dollars here (1.23) not pennies.";
    return result;
  }
  if (context.data.originalCurrency === undefined || context.data.originalCurrency == null ) {
    result.errMsg = "Original currency must be specified. For USD, use 'USD'.";
    return result;
  }
  result.originalAmt = context.data.originalAmt;
  result.originalCurrency = context.data.originalCurrency;
  //
  // subscription tier checks
  //
  if (user.tier === SubscriptionTypeMap.unverified) {
    result.errMsg = 'UNVERIFIED USERS CANNOT CHANGE TIERS';
    return result;
  }
  if (context.data.detail === undefined ) {
    result.errMsg = "Detail required for this event type.";
    return result;
  }
  if (context.data.detail.subscription === undefined || context.data.detail.subscription == null) {
    result.errMsg = "Detail.subscription required for this event type.";
    return result;
  }
  let subscription = context.data.detail.subscription;
  if (!Object.values(SubscriptionTypeMap).includes(subscription)) {
    result.errMsg = "Invalid detail.subscription.";
    return result;
  }
  if (subscription === SubscriptionTypeMap.solo) {
    result.errMsg = "You cannot subscribe to `Solo` in exchange for money."; // this might change later w 0 amt
    return result;
  }
  if (subscription === SubscriptionTypeMap.unverified) {
    result.errMsg = "You cannot subscribe to `Unverified` in exchange for money.";
    return result;
  }
  if (subscription === user.tier) {
    result.errMsg = "Cannot start a new subscription at tier " + user.tier + " as the user already has that subscription.";
    return result;
  }
  if (context.data.detail.currentSubscription) { // only do the check if the value is passed along
    if (context.data.detail.currentSubscription !== user.tier) {
      result.errMsg = "The caller has impression the user is currently at tier " + context.data.detail.currentSubscription + " but this is wrong. It is at " + user.tier + ".";
      return result;
    }
  }
  let oldState = user.subscriptionDetail.state;
  if (oldState === SubscriptionStateMap.closed) {
    result.errMsg = "Cannot start a subscription on a closed account.";
    return result;
  }
  if (oldState === SubscriptionStateMap.permDowngrade) {
    result.errMsg = "This account has been permanently downgraded to Solo. Please resolve this first.";
    return result;
  }
  result.newSubscriptionState = SubscriptionStateMap.good;
  result.newTier = subscription;
  //
  // term check
  //
  if (context.data.detail.term === undefined || context.data.detail.term == null ) {
    result.errMsg = "Detail.term (in months) required.";
    return result;
  }
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  if (result.newSubscriptionState !== oldState) {
    result.note += `; subscriptionState moved to ${result.newSubscriptionState} from ${oldState}`;
  }
  result.desc = `INITIAL SUBSCRIPTION FOR ${result.newTier}`;
  //
  // done
  //
  return result;
}