import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../accounting.js";
import {LedgerMap, SubscriptionStateMap, SubscriptionTypeMap} from "../services/users/users.subdocs.schema.js";

export async function DoSubscriptionServiceCompleted(context) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. get the user document (will naturally throw 404 on missing user error if not found)
  //
  let user = await context.app.service('users').get(context.data.userId);
  //
  // 2. verify supplied data
  //
  let detail = SubscriptionServiceCompletedVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 3. calculate the proper journal entries, summarize, optional tier
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
  } else {
    detail.newSubscriptionState = SubscriptionStateMap.due; // TODO: perhaps do detail.renewNextDay flag instead?
  }
  // TODO: handle subscriptions changing price between the date of payment and date of completion
  // TODO: safety check of 1-month interval since last "completion"; actually use that term field

  //
  // 4. update the user doc
  //
  context.data.transactionId = transaction.transactionId; // this is VERY important or we can't match the logs to the user journal entries
  await context.app.service('users').patch(user._id, {
    subscriptionState: detail.newSubscriptionState,
    userAccounting: user.userAccounting,
  });
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
    resolvedMonths: 0.0
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
  //
  // addedMonths checks
  //
  let resolvedMonths = context.data.detail.term ?? 0.0;
  if (resolvedMonths <= 0) {
    result.errMsg = "You cannot complete for 0 (or negative) months.";
    return result;
  }
  if (resolvedMonths > 1.0) {
    result.errMsg = "Currently only 1 (or a fraction of 1) months of resolution is supported.";
    return result;
  }
  result.resolvedMonths = resolvedMonths;
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `COMPLETED ${result.resolvedMonths} MONTHS OF SERVICE FOR ${subscription}`;
  //
  // done
  //
  return result;
}