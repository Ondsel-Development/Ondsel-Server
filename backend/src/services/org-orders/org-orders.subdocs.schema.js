import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {userSummarySchema} from "../users/users.subdocs.schema.js";
import {quotesSummarySchema} from "../quotes/quotes.distrib.js";

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
    quoteFromCache: Type.Boolean(),
    notes: Type.String(),
  },
)

export const sharedModelProductionQuoteSchema = Type.Object(
  {
    quoteTarget: Type.Literal(QuoteTargetMap.sharedModel),
    sharedModelId: ObjectIdSchema(),
    requestedBy: userSummarySchema,
    requestedAt: Type.Number(),
    daysGoodFor: Type.Number(),
    quote: quotesSummarySchema,
    quoteFromCache: Type.Boolean(),
    notes: Type.String(),
  },
)
