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
      balance[entry.ledger] += entry.amount * LedgerNature[entry.ledger]; // adds to debit ledgers; subtracts from credit ledgers
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

export function debit(transaction, ledger, amt) {
  // a debit records incoming money
  if (amt < 0) {
    throw "negative value passed to debit function";
  }
  let finalAmt = amt * LedgerNature[ledger];
  let entry = {
    ledger: ledger,
    amount: finalAmt,
  }
  transaction.entries.push(entry);
}
export function credit(transaction, ledger, amt) {
  // a credit records outgoing money
  if (amt < 0) {
    throw "negative value passed to credit function";
  }
  let finalAmt = amt * (-1) * LedgerNature[ledger];
  let entry = {
    ledger: ledger,
    amount: finalAmt,
  }
  transaction.entries.push(entry);
}

export function verifyBalanced(transaction) {
  let errMsg = "";
  let balance = 0.0;
  let entry;
  for (entry of transaction.entries) {
    balance += entry.amount;
  }
  if (balance != 0.0) {
    errMsg = `Transaction unbalanced: ${transaction.entries}.`;
  }
  return errMsg;
}
