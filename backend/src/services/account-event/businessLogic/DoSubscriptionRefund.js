import {
  addTransactionToUserAndSummarize,
  credit,
  debit,
  makeEmptyJournalTransaction,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionStateMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";

export async function DoSubscriptionRefund(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = SubscriptionRefundVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. calculate the proper journal entries, summarize, optional tier
  //    see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);
  // This is a possible double entry
  // First: debit cash AND credit salesReturnsAndAllowances
  debit(transaction, LedgerMap.salesReturnsAndAllowances, detail.amt)
  credit(transaction, LedgerMap.cash, detail.amt);
  // Second: clear up unearnedRevenue liability, if any.
  if (detail.unearnedRevenueAmt > 0) {
    debit(transaction, LedgerMap.unearnedRevenue, detail.unearnedRevenueAmt);
    credit(transaction, LedgerMap.revenue, detail.unearnedRevenueAmt);
  }
  let balanceMsg = verifyBalanced(transaction);
  if (balanceMsg !== "") {
    context.data.resultMsg = balanceMsg;
    return;
  }
  addTransactionToUserAndSummarize(user, transaction);
  //
  // 3. update the user doc
  //
  context.data.transactionId = transaction.transactionId; // this is VERY important or we can't match the logs to the user journal entries
  await context.app.service('users').patch(user._id, {
    userAccounting: user.userAccounting,
  });
  //
  // all is good; return message
  //
  context.data.success = true;
  context.data.resultMsg = "SUCCESS: " +  detail.desc;
}

function SubscriptionRefundVerification(context, user) {
  let result = {
    errMsg: "",
    amt: 0,
    unearnedRevenueAmt: 0,
    desc: "",
    note: "",
  }
  //
  // amount checks
  //
  let amt = context.data.amount;
  let cash = user.userAccounting.ledgerBalances.Cash;
  if (amt === undefined || result.amt == null ) {
    result.errMsg = "Amount must be set to an integer (in pennies) for this event type.";
    return result;
  }
  if (amt != Math.round(amt)) {
    result.errMsg = "Amount must be a simple integer measuring pennies (100ths of USD), not a float, for this event type.";
    return result;
  };
  if (amt > cash) {
    result.errMsg = `This person has only ever paid us ${cash}. Not possible to refund this much.`;
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
  // resolve outstanding liability
  //
  let unearnedRevenueBalance = user.userAccounting.ledgerBalances.UnearnedRevenue;
  if (unearnedRevenueBalance > 0) {
    result.unearnedRevenueAmt = unearnedRevenueBalance;
    if (result.unearnedRevenueAmt > amt) {
      result.unearnedRevenueAmt = amt;
    }
  }
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `REFUND`;
  //
  // done
  //
  return result;
}
