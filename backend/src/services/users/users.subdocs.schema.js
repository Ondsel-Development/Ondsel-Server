// subdocuments used by users.schema.js and users of that schema

import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import {CurrencyType} from "../../currencies.js";
import {agreementCategoryType} from "../agreements/agreements.schema.js";

export const SubscriptionTypeMap = {
  solo: 'Solo',
  peer: 'Peer',
  enterprise: 'Enterprise',
  // legacy entries TODO: remove on release after next
  free: 'Free',
  premium: 'Premium',
}

export const SubscriptionTypeANON = "anonymous"

export const SubscriptionType = StringEnum(
  [
    SubscriptionTypeMap.solo,
    SubscriptionTypeMap.peer,
    SubscriptionTypeMap.enterprise,
    // legacy entries TODO: remove on release after next
    SubscriptionTypeMap.free,
    SubscriptionTypeMap.premium,
  ]
)

export const userSummarySchema = Type.Object(
  {
    userId: ObjectIdSchema(),
    name: Type.String(),
  }
)

export const SubscriptionStateMap = {
  good: 'good',
  due: 'due',
  pastDue: 'past-due',
  tempDowngrade: 'temp-downgrade',
  permDowngrade: 'perm-downgrade',
  closed: 'closed',
}
export const SubscriptionStateType = StringEnum(
    // see https://docs.google.com/document/d/1KDrAk16LUz4o6D3rsn03DDM2BDGsizbMXGnNLn_wkx8/edit?usp=sharing
  [
    SubscriptionStateMap.good,
    SubscriptionStateMap.due,
    SubscriptionStateMap.pastDue,
    SubscriptionStateMap.tempDowngrade,
    SubscriptionStateMap.permDowngrade,
    SubscriptionStateMap.closed,
  ]
)

export const SubscriptionTermTypeMap = {
  monthly: 'Monthly',
  yearly: 'Yearly',
}
export const SubscriptionTermType = StringEnum(
  [
    SubscriptionTermTypeMap.monthly,
    SubscriptionTermTypeMap.yearly,
  ]
);

export const subscriptionDetailSchema= Type.Object(
  {
    state: SubscriptionStateType,
    term: Type.Optional(Type.Union([Type.Null(), SubscriptionTermType])),
    anniversary: Type.Optional(Type.Union([Type.Null(), Type.Number()])),
  }
);

export const LedgerMap = {
  cash: 'Cash',
  processorExpense: 'ProcessorExpense',
  unearnedRevenue: 'UnearnedRevenue',
  revenue: 'Revenue',
  salesReturnsAndAllowances: 'SalesReturnsAndAllowances',
}

export const LedgerNature = {
  'Cash': 1,                           // +1 DEBIT  as ASSET
  'ProcessorExpense': 1,               // +1 DEBIT  as EXPENSE
  'UnearnedRevenue': -1,               // -1 CREDIT as LIABILITY
  'Revenue': -1,                       // -1 CREDIT as INCOME
  'SalesReturnsAndAllowances': 1,      // +1 DEBIT  as CONTRA-REVENUE
}
export const Ledger = StringEnum(
  [
    LedgerMap.cash,
    LedgerMap.processorExpense,
    LedgerMap.unearnedRevenue,
    LedgerMap.revenue,
    LedgerMap.salesReturnsAndAllowances,
  ]
)

export const journalElementSchema = Type.Object(
  {
    ledger: Ledger,
    amount: Type.Integer(),
    currency: Type.Optional(Type.Union([CurrencyType, Type.Null()])),  // currency display only needed on inbound/outbound entries to processor
    currencyAmt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
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
        // base10 decimal not supported by feathersjs; so store money in integer pennies
        Cash: Type.Integer(),                      // ASSET
        ProcessorExpense: Type.Integer(),          // EXPENSE
        UnearnedRevenue: Type.Integer(),           // LIABILITY
        Revenue: Type.Integer(),                   // INCOME
        SalesReturnsAndAllowances: Type.Integer(), // CONTRA-REVENUE (negative income)
      }
    ),
    journal: Type.Array(journalTransactionSchema),
  }
)

export const specificAgreementCompletionType = Type.Object(
  {
    agreementDocId: ObjectIdSchema(),
    category: agreementCategoryType,
    title: Type.String(),
    version: Type.String(),
    whenAgreedTo: Type.String(), // the legal text version
    when: Type.Number(),         // the database searchable version of whenAgreedTo
  }
)
export const agreementsAcceptedSchema = Type.Object(
  {
    currentPrivacyPolicyVersion: Type.Union([Type.String(), Type.Null()]),
    currentTermsOfServiceVersion: Type.Union([Type.String(), Type.Null()]),
    history: Type.Array(specificAgreementCompletionType),
  }
)
