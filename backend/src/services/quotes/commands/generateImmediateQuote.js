import _ from 'lodash';
import {QUOTE_LIFESPAN, ThirdPartyVendorTypeMap} from "../quotes.subdocs.schema.js";
import {BadRequest} from "@feathersjs/errors";
import {currencyTypeMap} from "../../../currencies.js";
import {agreementCategoryTypeMap} from "../../agreements/agreements.subdocs.js";
import {ObjectId} from "mongodb";

export const generateImmediateQuote = async (context) => {
  // check context.data
  const { data } = context;
  data.completed = false;
  data.isFromCache = false;
  data.requestedAt = Date.now();
  data.createdAt = undefined;
  data.orderId = new ObjectId(data.orderId);
  data.fileId = new ObjectId(data.fileId);
  data.fileVersionId = new ObjectId(data.fileVersionId);
  if (data.quantity) {
    data.quantity = Math.floor(Number(data.quantity) || 0); // anything is made an int
  } else {
    throw new BadRequest(`missing quantity`);
  }
  if (data.quantity <= 0) {
    throw new BadRequest(`unable to process a negative quantity: ${data.quantity}`);
  }
  if (data.priceCurrency !== currencyTypeMap.USD) {
    throw new BadRequest(`only supporting priceCurrency of ${currencyTypeMap.USD}`);
  }
  let itemFoundFlag = await searchForExistingQuote(context);
  if (!itemFoundFlag) {
    await getFreshQuote(context);
  }
}

export async function searchForExistingQuote(context) {
  const quoteService = context.app.service('quotes');
  const quoteDb = await quoteService.options.Model;
  const { data } = context;
  const lifeSpanForSource = QUOTE_LIFESPAN[data.source];
  const atLeastOneWeekLeft = lifeSpanForSource - (7 * 24 * 60 * 60);
  const oldestDateAllowed = Date.now() - atLeastOneWeekLeft;
  const query = {
    // eligibility fields
    createdAt: {$gt: oldestDateAllowed},
    isFromCache: false,  // technically, this search param should NEVER be needed as we don't store copied in DB
    // fields to match
    fileId: data.fileId,
    fileVersionId: data.fileVersionId,
    quantity: data.quantity,
    priceCurrency: data.priceCurrency,
    source: data.source,
    otherParams: data.otherParams || {},
  }
  const findings = await quoteDb.find(query).sort({createdAt: -1}).limit(1).toArray();
  if (findings.length === 1) {
    // setting context.result with a result prevents a new document from being generated
    context.result = findings[0];
    context.result.orderId = data.orderId;
    context.result.isFromCache = true;
    return true;
  }
  return false;
}

export async function getFreshQuote(context) {
  // it is assumed that context.data has been vetted for legit values
  // returns with context.data containing the new quote document
  const { data } = context;
  data.completed = false;
  data.isFromCache = false;
  data.requestedAt = Date.now();
  data.createdAt = undefined;
  data.cacheable = !(data.otherParams && Object.keys(data.otherParams).length > 0);
  switch (data.source) {
    case ThirdPartyVendorTypeMap.slant3D:
      // TODO: in later Jira LENS-194 task, we will actually call the Slant 3D service. For now, make something up:
      const quoteResult = {
        "message": "Slicing successful",
        "data": {
          "price": "$8.23"
        }
      }
      if (quoteResult.message !== 'Slicing successful') {
        throw new BadRequest(`did not successfully process quote: ${quoteResult.message}`);
      }
      data.createdAt = Date.now()
      let rawPrice = quoteResult.data?.price || '0';
      let totalPrice = Number(rawPrice.replace(/[^0-9\.-]+/g,""));
      let totalPennies = totalPrice * 100.0;
      data.pricePerUnit = Math.round(totalPennies / data.quantity);
      data.vendorResult = (quoteResult.message || 'no result returned') + `; original total ${rawPrice}`;
      data.vendorUrl = "TBD";
      break;
    default:
      throw new BadRequest(`Support for 3rd party vendor source "${data.source}" not implemented yet`);
  }
}