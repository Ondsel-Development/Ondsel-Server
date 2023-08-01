// subdocuments used by users.schema.js and users of that schema

import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'

export const SubscriptionTypeMap = {
  free: 'Free',
  premium: 'Premium',
  enterprise: 'Enterprise',
}
export const SubscriptionType = StringEnum(
  [
    SubscriptionTypeMap.free,
    SubscriptionTypeMap.premium,
    SubscriptionTypeMap.enterprise,
  ]
)

export const userSummarySchema = Type.Object(
  {
    userId: ObjectIdSchema(),
    name: Type.String(),
  }
)

export const SubscriptionStateType = StringEnum(
    // see https://docs.google.com/document/d/1KDrAk16LUz4o6D3rsn03DDM2BDGsizbMXGnNLn_wkx8/edit?usp=sharing
  [
    'good',
    'due',
    'past-due',
    'temp-downgrade',
    'perm-downgrade',
    'closed',
  ]
)

export const LedgerMap = {
  cash: 'Cash',
  processorExpense: 'ProcessorExpense',
  unearnedRevenue: 'UnearnedRevenue',
  revenue: 'Revenue',
  refunds: 'Refunds',
}

export const LedgerNature = {
  'Cash': 1,              // +1 DEBIT as ASSET
  'ProcessorExpense': 1,  // +1 DEBIT as EXPENSE
  'UnearnedRevenue': -1,  // -1 CREDIT as LIABILITY
  'Revenue': -1,          // -1 CREDIT for INCOME
  'Refunds': -1,          // -1 CREDIT for LIABILITY
}
export const Ledger = StringEnum(
  [
    LedgerMap.cash,
    LedgerMap.processorExpense,
    LedgerMap.unearnedRevenue,
    LedgerMap.revenue,
    LedgerMap.refunds,
  ]
)

export const journalElementSchema = Type.Object(
  {
    ledger: Ledger,
    amount: Type.Integer()
  }
)

export const journalTransactionSchema = Type.Object(
  {
    transactionId: ObjectIdSchema(),
    time: Type.Number(),
    description: Type.String(),
    entries: Type.Array(journalElementSchema)
  }
)

export const userAccountingSchema = Type.Object(
  {
    ledgerBalances: Type.Object(
      {
        Cash: Type.Integer(), // ASSET; base10 decimal not supported by feathersjs; so store money in integer pennies
        ProcessorExpense: Type.Integer(), // EXPENSE
        UnearnedRevenue: Type.Integer(), // INCOME
        Revenue: Type.Integer(), // INCOME
        Refunds: Type.Integer(), // inverted INCOME (EXPENSE)
      }
    ),
    journal: Type.Array(journalTransactionSchema),
  }
)
