import {BadRequest} from "@feathersjs/errors";
import {
  buildFileVersionProductionQuote,
  buildSharedModelProductionQuote,
  QuoteTargetMap
} from "../org-orders.subdocs.schema.js";
import {CurrencyType, currencyTypeMap} from "../../../currencies.js";
import {ObjectIdSchema, Type} from "@feathersjs/typebox";
import {ThirdPartyVendorType} from "../../quotes/quotes.subdocs.schema.js";
import {ObjectId} from "mongodb";

export const getNewQuote = async (context) => {
  const { data } = context;
  const user = context.params.user;
  const quotesService = context.app.service('quotes');

  let fileId = data.fileId;
  let versionId = data.versionId;
  let sharedModelId = data.sharedModelId;
  let quantity = data.quantity || 1;
  let priceCurrency = data.priceCurrency || currencyTypeMap.USD;
  let targetSource = data.source;

  let quoteType = sharedModelId ? QuoteTargetMap.sharedModel : QuoteTargetMap.fileVersion;
  let updatedProductionQuotes = context.beforePatchCopy.productionQuotes;

  let newQuote = await quotesService.create({
    originatingUserId: user._id,
    orderId: new ObjectId(),
    fileId: fileId,
    fileVersionId: versionId,
    source: targetSource,
    priceCurrency: priceCurrency,
    quantity: quantity,
    otherParams: {},
    promotion: {},
  })

  let newQuoteSummary;
  switch (quoteType) {
    case QuoteTargetMap.fileVersion:
      newQuoteSummary = buildFileVersionProductionQuote(newQuote, user);
      break;
    case QuoteTargetMap.sharedModel:
      newQuoteSummary = buildSharedModelProductionQuote(newQuote, user);
      break;
    default:
      throw new BadRequest(`Unknown quote type: ${quoteType}`);
  }
  updatedProductionQuotes.push(newQuoteSummary);

  context.data.productionQuotes = updatedProductionQuotes;
  delete context.data.shouldGetNewQuote;
  delete context.data.fileId;
  delete context.data.versionId;
  delete context.data.sharedModelId;
  delete context.data.quantity;
  delete context.data.priceCurrency;
  delete context.data.source;
}
