import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionStateMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";

export async function DoSubscriptionServiceCompleted(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = SubscriptionServiceCompletedVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. calculate the proper journal entries, summarize, optional tier
  //    see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);

  debit(transaction, LedgerMap.unearnedRevenue, detail.amt);
  credit(transaction, LedgerMap.revenue, detail.amt);
  let balanceMsg = verifyBalanced(transaction);
  if (balanceMsg !== "") {
    context.data.resultMsg = balanceMsg;
    return;
  }
  addTransactionToUserAndSummarize(user, transaction);
  if (user.userAccounting.ledgerBalances.UnearnedRevenue >= detail.amt) {
    detail.newSubscriptionState = SubscriptionStateMap.good;
  } else if (detail.tierChanged && detail.tier === SubscriptionTypeMap.free) {
    detail.newSubscriptionState = SubscriptionStateMap.good;
  } else {
    detail.newSubscriptionState = SubscriptionStateMap.due;
  }
  //
  // 3. update the user doc
  //
  context.data.transactionId = transaction.transactionId; // this is VERY important or we can't match the logs to the user journal entries
  if (detail.tierChanged) {
    await context.app.service('users').patch(user._id, {
      tier: detail.tier,
      nextTier: null,
      subscriptionState: detail.newSubscriptionState,
      userAccounting: user.userAccounting,
    });
  } else {
    await context.app.service('users').patch(user._id, {
      subscriptionState: detail.newSubscriptionState,
      userAccounting: user.userAccounting,
    });
  }
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
}

function SubscriptionServiceCompletedVerification(context, user) {
  let result = {
    errMsg: "",
    amt: 0,
    desc: "",
    note: "",
    newSubscriptionState: SubscriptionStateMap.due, // the default is to bill again the next day
    resolvedMonths: 0.0,
    tierChanged: false,
    tier: null,
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
  if (amt < 0) { // zero is allowed for "service completed"
    result.errMsg = "Amount must be a positive integer (in pennies) for this event type.";
    return result;
  }
  if (amt > 100000) {
    result.errMsg = "Amount must be a below 100000 (1000.00 USD) to be valid.";
    return result;
  }
  if (user.userAccounting.ledgerBalances.UnearnedRevenue < amt) {
    result.errMsg =  `Account has ${user.userAccounting.ledgerBalances.UnearnedRevenue} in unearned revenue. You can't complete ${amt} of service with that low a number. SOMETHING IS WRONG!`;
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
  let subscription = context.data.detail.subscription;
  if (subscription !== user.tier) {
    result.errMsg = `The completion of subscription for ${subscription} does not match the user's tier of ${user.tier}.`;
    return result;
  }
  if (user.nextTier !== undefined && user.nextTier != null) {
    // nextTier is set, so upgrade/downgrade to the new level
    result.tier = user.nextTier;
    result.tierChanged = true;
  } else {
    result.tier = user.tier;
  }
  //
  // resolvedMonths
  //
  let resolvedMonths = context.data.detail.term
  result.resolvedMonths = resolvedMonths;
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `COMPLETED ${result.resolvedMonths} MONTHS OF SERVICE FOR ${subscription}`;
  if (result.tierChanged) {
    result.desc += " AND NEXT PERIOD WILL BE " + result.tier
  }
  //
  // done
  //
  return result;
}