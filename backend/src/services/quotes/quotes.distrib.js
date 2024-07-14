import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {ThirdPartyVendorType} from "./quotes.subdocs.schema.js";
import {CurrencyType} from "../../currencies.js";

export const quotesSummarySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Optional(Type.Number()),    // the date the quote was RECEIVED from 3rd party; used for "aging" the quote
    fileId: ObjectIdSchema(),
    fileVersionId: ObjectIdSchema(),
    source: ThirdPartyVendorType,
    pricePerUnit: Type.Optional(Type.Number()), // defaults to USD cents  (USD * 100)
    priceCurrency: CurrencyType,                // defaults to 'USD' for now
    quantity: Type.Number(),
  },
)

export function buildQuotesSummary(quote) {
  let summary = {};
  if (quote) {
    summary = {
      _id: quote._id,
      createdAt: quote.createdAt || undefined,
      fileId: quote.fileId,
      fileVersionId: quote.fileVersionId,
      source: quote.source,
      pricePerUnit: quote.pricePerUnit || undefined,
      priceCurrency: quote.priceCurrency,
      quantity: quote.quantity,
    };
  }
  return summary;
}
