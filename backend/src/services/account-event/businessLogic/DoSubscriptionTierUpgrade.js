// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  addTransactionToUserAndSummarize, calculateCredit,
  credit,
  debit,
  makeEmptyJournalTransaction, validNumberCheck,
  verifyBalanced
} from "../../../accounting.js";
import {LedgerMap, SubscriptionTermTypeMap, SubscriptionTypeMap} from "../../users/users.subdocs.schema.js";
import { sendNotificationToSlack } from '../../../slack-notifications.js';


export async function DoSubscriptionTierUpgrade(context, user) {
  // it is presumed that the processor has a confirmed charge at this point
  // hook.success is set to false already
  //
  // 1. verify supplied data
  //
  let detail = SubscriptionTierUpgradeVerification(context, user);
  if (detail.errMsg !== "") {
    context.data.resultMsg = detail.errMsg;
    return;
  }
  //
  // 2. see https://docs.google.com/document/d/1LE7otARHoOPTuj6iZQjg_IBzBWq0oZHFT-u_tt9YWII/edit?usp=sharing
  //
  let transaction = makeEmptyJournalTransaction(detail.desc, detail.note);
  debit(transaction, LedgerMap.unearnedRevenue, detail.unearnedRevenueDebit);
  credit(transaction, LedgerMap.revenue, detail.revenue);
  if (detail.customerCredit > 0) {
    credit(transaction, LedgerMap.customerCredit, detail.customerCredit);
  }
  if (detail.proportionalCharge > 0) {
    debit(transaction, LedgerMap.cash, detail.proportionalCharge);
    credit(transaction, LedgerMap.unearnedRevenue, detail.proportionalCharge);
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
  user.subscriptionDetail.term = detail.term;
  user.subscriptionDetail.
  context.data.transactionId = transaction.transactionId; // this is VERY important; otherwise we can't match the logs to the user journal entries
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
    `🎉 Tier Upgrade Alert! 🎉\n\nUser (user: *${user.name}*, email: *${user.email}*) user upgrade tier from *${user.tier}* to *${detail.newTier}*`
  )
}

function SubscriptionTierUpgradeVerification(context, user) {
  let result = {
    errMsg: "",
    desc: "",
    note: "",
    newTier: "",
    customerCredit: 0,
    revenue: 0,
    unearnedRevenueDebit: 0,
    proportionalCharge: 0,
    term: "",
  }
  if (user.tier === SubscriptionTypeMap.unverified) {
    result.errMsg = 'UNVERIFIED USERS CANNOT CHANGE TIERS. It doesn\'t even make sense here.';
    return result;
  }
  if (user.tier === SubscriptionTypeMap.solo) {
    result.errMsg = 'SOLO USERS DONT HAVE A FINANCIAL SUBSCRIPTION ESTABLISHED. Use initial-subscription-purchase instead.';
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
  // it is okay to "overwrite" the current planned upgrade with a new one. So, that is not checked here.
  if (result.newTier === currentTier) {
    result.newTier = null;
    result.note = String(context.data.note);
    result.desc = `UPGRADE CANCELLED; ACCOUNT WILL STAY AT ${currentTier}`;
    return result;
  }
  //
  // upgrade transaction (from Stripe) details
  //
  result.customerCredit = context.data.detail.customerCredit;
  let checkMsg = validNumberCheck(result.customerCredit, "customerCredit");
  if (checkMsg !== 'good') {
    result.errMsg = checkMsg;
    return result;
  }
  result.revenue = context.data.detail.revenue;
  checkMsg = validNumberCheck(result.revenue, "revenue");
  if (checkMsg !== 'good') {
    result.errMsg = checkMsg;
    return result;
  }
  result.proportionalCharge = context.data.detail.amount;
  checkMsg = validNumberCheck(result.proportionalCharge, "proportionalCharge");
  if (checkMsg !== 'good') {
    result.errMsg = checkMsg;
    return result;
  }
  result.term = context.data.detail.term;
  if (result.term !== SubscriptionTermTypeMap.monthly && result.term !== SubscriptionTermTypeMap.yearly) {
    result.errMsg = `SUBSCRIPTION TERM "${result.term}" IS NOT VALID`;
    return result;
  }
  if (result.proportionalCharge > 0 && result.customerCredit > 0) {
    result.errMsg = `YOU CANNOT GENERATE A CUSTOMER CREDIT *AND* CREATE A NEW CHARGE AT THE SAME TIME. SOMETHING IS VERY WRONG.`;
    return result;
  }
  result.unearnedRevenueDebit = result.revenue + result.customerCredit;
  //
  // descriptions for transaction
  //
  result.note = String(context.data.note);
  result.desc = `UPGRADE TO ${result.newTier} FROM ${currentTier}`;
  //
  // done
  //
  return result;
}
