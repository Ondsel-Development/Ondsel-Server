// subdocuments used by users.schema.js and users of that schema

import { Type } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import {CurrencyType} from "../../currencies.js";
import _ from "lodash";
import {agreementCategoryType} from "../agreements/agreements.subdocs.js";

export const SubscriptionTypeMap = {
  unverified: 'Unverified',
  community: 'Community',
  solo: 'Solo',
  basic: 'Basic',
  peer: 'Peer',
  enterprise: 'Enterprise',
}

export const SubscriptionTypeANON = "anonymous"

export const SubscriptionType = StringEnum(
  [
    SubscriptionTypeMap.unverified,
    SubscriptionTypeMap.community,
    SubscriptionTypeMap.solo,
    SubscriptionTypeMap.basic,
    SubscriptionTypeMap.peer,
    SubscriptionTypeMap.enterprise,
  ]
)

export const userSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    username: Type.String(),
    name: Type.String(),
    tier: SubscriptionType,
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
    lastRenewalDate: Type.Optional(Type.Number()), // if missing, use anniversary
    stripeSubscriptionId: Type.Optional(Type.String()), // if missing, no Stripe-handled subscription active
  }
);


export const SubscriptionConstraintsType = Type.Object(
  {
    maxModelObjects: Type.Number(),
    maxShareLinksPerModel: Type.Number(),
    canUpload: Type.Boolean(),
    canDownloadOriginal: Type.Boolean(),
    canUpdateModelParameters: Type.Boolean(),
    canExportModel: Type.Boolean(),
    defaultValueOfPublicLinkGeneration: Type.Boolean(),
    canDisableAutomaticGenerationOfPublicLink: Type.Boolean(),
  }
)


export const subscriptionConstraintMap = {
  'Unverified': {
    maxModelObjects: 0,
    maxShareLinksPerModel: 0,
    canUpload: false,
    canDownloadOriginal: false,
    canUpdateModelParameters: false,
    canExportModel: false,
    defaultValueOfPublicLinkGeneration: true,
    canDisableAutomaticGenerationOfPublicLink: false,
    canCreateOpenOrganization: false,
    canCreatePrivateOrganization: false,
  },
  'Solo': {
    maxModelObjects: 50,
    maxShareLinksPerModel: 2,
    canUpload: true,
    canDownloadOriginal: true,
    canUpdateModelParameters: false,
    canExportModel: false,
    defaultValueOfPublicLinkGeneration: true,
    canDisableAutomaticGenerationOfPublicLink: false,
    canCreateOpenOrganization: false,
    canCreatePrivateOrganization: false,
  },
  'Peer': {
    maxModelObjects: 250,
    maxShareLinksPerModel: 10,
    canUpload: true,
    canDownloadOriginal: true,
    canUpdateModelParameters: true,
    canExportModel: true,
    defaultValueOfPublicLinkGeneration: false,
    canDisableAutomaticGenerationOfPublicLink: true,
    canCreateOpenOrganization: true,
    canCreatePrivateOrganization: false,
  },
  'Enterprise': {
    maxModelObjects: 1000,
    maxShareLinksPerModel: 100,
    canUpload: true,
    canDownloadOriginal: true,
    canUpdateModelParameters: true,
    canExportModel: true,
    defaultValueOfPublicLinkGeneration: false,
    canDisableAutomaticGenerationOfPublicLink: true,
    canCreateOpenOrganization: true,
    canCreatePrivateOrganization: true,
  },
};

export function getConstraint(user){
  return _.get(subscriptionConstraintMap, user?.tier, SubscriptionTypeMap.unverified);
}

export const LedgerMap = {
  cash: 'Cash',
  unearnedRevenue: 'UnearnedRevenue',
  revenue: 'Revenue',
  salesReturnsAndAllowances: 'SalesReturnsAndAllowances',
  customerCredit: 'CustomerCredit',
}

export const LedgerNature = {
  'Cash': 1,                           // +1 DEBIT  as ASSET
  'UnearnedRevenue': -1,               // -1 CREDIT as LIABILITY
  'CustomerCredit': -1,                // -1 CREDIT as LIABILITY
  'Revenue': -1,                       // -1 CREDIT as INCOME
  'SalesReturnsAndAllowances': 1,      // +1 DEBIT  as CONTRA-REVENUE
}
export const Ledger = StringEnum(
  [
    LedgerMap.cash,
    LedgerMap.unearnedRevenue,
    LedgerMap.customerCredit,
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
