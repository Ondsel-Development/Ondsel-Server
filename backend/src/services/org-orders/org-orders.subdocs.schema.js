import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {userSummarySchema} from "../users/users.subdocs.schema.js";
import {buildQuotesSummary, quotesSummarySchema} from "../quotes/quotes.distrib.js";
import {buildUserSummary} from "../users/users.distrib.js";
import {calculateRemainingAge} from "../quotes/quotes.helpers.js";

export const QuoteTargetMap = {
    fileVersion: 'file-version',
    sharedModel: 'shared-model',
}

export const fileVersionProductionQuoteSchema = Type.Object(
  {
    quoteTarget: Type.Literal(QuoteTargetMap.fileVersion),
    requestedBy: userSummarySchema,
    requestedAt: Type.Number(),
    daysGoodFor: Type.Number(),
    quote: quotesSummarySchema,
    notes: Type.String(),
  },
)

export function buildFileVersionProductionQuote(quote, user) {
  const userSummary = buildUserSummary(user);
  const quoteSummary = buildQuotesSummary(quote);
  const result = {
    quoteTarget: QuoteTargetMap.fileVersion,
    requestedBy: userSummary,
    requestedAt: quote.requestedAt,
    daysGoodFor: calculateRemainingAge(quote),
    quote: quoteSummary,
    notes: '',
  }
  return result;
}

export const sharedModelProductionQuoteSchema = Type.Object(
  {
    quoteTarget: Type.Literal(QuoteTargetMap.sharedModel),
    sharedModelId: ObjectIdSchema(),
    requestedBy: userSummarySchema,
    requestedAt: Type.Number(),
    daysGoodFor: Type.Number(),
    quote: quotesSummarySchema,
    notes: Type.String(),
  },
)

export function buildSharedModelProductionQuote(quote, user) {
  const userSummary = buildUserSummary(user);
  const quoteSummary = buildQuotesSummary(quote);
  return {
    quoteTarget: QuoteTargetMap.sharedModel,
    requestedBy: userSummary,
    requestedAt: quote.requestedAt,
    daysGoodFor: calculateRemainingAge(quote),
    quote: quoteSummary,
    notes: '',
  }
}
