// John's crude accounting library

import {ObjectId} from "mongodb";
import {LedgerMap, LedgerNature} from "./services/users/users.subdocs.schema.js";
import {resolveObjectId} from "@feathersjs/mongodb";

export function addTransactionToUserAndSummarize(user, transaction) {
  if (!user.userAccounting) {
    user.userAccounting = {
      journal: []
    };
  }
  if (!user.userAccounting.journal) {
    user.userAccounting.journal = [];
  }
  //
  // add transaction
  //
  user.userAccounting.journal.push(transaction);
  //
  // create fresh summaries
  //
  let ledgerName;
  let balance = {};
  for (ledgerName in LedgerNature) {
    balance[ledgerName] = 0;
  };
  let te;
  for (te of user.userAccounting.journal) {
    let entry;
    for (entry of te.entries) {
      balance[entry.ledger] += entry.amount;
    }
  }
  user.userAccounting.ledgerBalances = balance;
}

export function makeEmptyJournalTransaction(description, note) {
  let transaction = {
    transactionId: new ObjectId(),
    time: Date.now(),
    description: description,
    internalNote: note,
    entries: [],
  };
  return transaction;
}

export function debit(transaction, ledger, amt, origCurrency, origAmt) {
  // a debit records incoming money
  if (amt < 0) {
    throw "negative value passed to debit function";
  }
  let finalAmt = amt * LedgerNature[ledger];
  let entry = {
    ledger: ledger,
    amount: finalAmt,  // pennies USD; always.
    currency: origCurrency,
    currencyAmt: origAmt,
  }
  transaction.entries.push(entry);
}
export function credit(transaction, ledger, amt, origCurrency, origAmt) {
  // a credit records outgoing money
  if (amt < 0) {
    throw "negative value passed to credit function";
  }
  let finalAmt = amt * (-1) * LedgerNature[ledger];
  let entry = {
    ledger: ledger,
    amount: finalAmt,
    currency: origCurrency,
    currencyAmt: origAmt,
  }
  transaction.entries.push(entry);
}

export function verifyBalanced(transaction) {
  let errMsg = "";
  let balance = 0;
  let entry;
  for (entry of transaction.entries) {
    if (LedgerNature[entry.ledger] === 1) {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
    }
  }
  if (balance !== 0) {
    errMsg = `Transaction unbalanced: ${transaction.entries}.`;
  }
  return errMsg;
}
