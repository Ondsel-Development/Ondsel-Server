import {addTransactionToUserAndSummarize, debit, makeEmptyJournalTransaction, verifyBalanced} from "../accounting.js";
import {LedgerMap, SubscriptionStateMap, SubscriptionTypeMap} from "../services/users/users.subdocs.schema.js";

export async function DoInitialSubscriptionPurchase(context) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. get the user document (will naturally throw 404 on missing user error if not found)
  //
  let user = await context.app.service('users').get(context.data.userId);
  //
  // 2. verify supplied data
  //
  let detail = InitialSubscriptionPurchaseVerification(context, user);
  if (detail.errMsg != "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 3. calculate the proper journal entries, summarize, optional tier
  //    see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);
  debit(transaction, LedgerMap.cash, detail.amt);
  debit(transaction, LedgerMap.unearnedRevenue, detail.amt);
  let balanceMsg = verifyBalanced(transaction);
  if (balanceMsg != "") {
    context.data.resultMsg = balanceMsg;
    return;
  }
  addTransactionToUserAndSummarize(user, transaction);

  //
  // 4. update the user doc
  //
  context.data.transactionId = transaction.transactionId; // this is VERY important or we can't match the logs to the user journal entries
  await context.app.service('users').patch(user._id, {
    tier: detail.newTier,
    subscriptionState: detail.newSubscriptionState,
    userAccounting: user.userAccounting,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
}

function InitialSubscriptionPurchaseVerification(context, user) {
  let result = {
    errMsg: "",
    amt: 0,
    newTier: "",
    newSubscriptionState: "",
    addedMonths: 0.0,
    desc: "",
    note: "",
  }
  //
  // amount checks
  //
  let amt = context.data.amount;
  if (amt === undefined || result.amt == null ) {
    result.errMsg = "Amount must be set to an integer (in pennies) for this event type.";
    return result;
  }
  if (amt != Math.round(amt)) {
    result.errMsg = "Amount must be a simple integer measuring pennies (100ths of USD), not a float, for this event type.";
    return result;
  };
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
  // subscription tier checks
  //
  if (context.data.detail === undefined ) {
    result.errMsg = "Detail required for this event type.";
    return result;
  }
  if (context.data.detail.subscription === undefined || context.data.detail.subscription == null) {
    result.errMsg = "Detail.subscription required for this event type.";
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
  if (subscription === SubscriptionTypeMap.free) {
    result.errMsg = "You cannot subscribe to `free` in exchange for money."; // this might change later w 0 amt
    return result;
  }
  if (subscription == user.tier) {
    result.errMsg = "Cannot start a new subscription at tier " + user.tier + " as the user already has that subscription.";
    return result;
  }
  if (context.data.detail.currentSubscription) { // only do the check if the value is passed along
    if (context.data.detail.currentSubscription != user.tier) {
      result.errMsg = "The caller has impression the user is currently at tier " + context.data.detail.currentSubscription + " but this is wrong. It is at " + user.tier + ".";
      return result;
    }
  }
  let oldState = user.subscriptionState;
  if (oldState === SubscriptionStateMap.closed) {
    result.errMsg = "Cannot start a subscription on a closed account.";
    return result;
  }
  if (oldState === SubscriptionStateMap.permDowngrade) {
    result.errMsg = "This account has been permanently downgraded to Free. Please resolve this first.";
    return result;
  }
  result.newSubscriptionState = SubscriptionStateMap.good;
  result.newTier = subscription;
  //
  // addedMonths checks
  //
  let addedMonths = context.data.detail.termAddedMonths ?? 0.0;
  if (addedMonths <= 0) {
    result.errMsg = "You cannot subscribe for 0 (or negative) months.";
    return result;
  }
  if (addedMonths > 1.0) {
    result.errMsg = "Currently only 1 (or a fraction of 1) months of renewal is supported.";
    return result;
  }
  result.addedMonths = addedMonths;
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  if (result.newSubscriptionState != oldState) {
    result.note += `; substate moved to ${result.newSubscriptionState} from ${oldState}`;
  }
  result.desc = `INITIAL SUBSCRIPTION FOR ${result.newTier}`;
  //
  // done
  //
  return result;
}