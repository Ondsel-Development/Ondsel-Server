import _ from 'lodash';
import {ThirdPartyVendorTypeMap} from "../quotes.subdocs.schema.js";
import {BadRequest} from "@feathersjs/errors";
import {currencyTypeMap} from "../../../currencies.js";

export const generateImmediateQuote = async (context) => {
  const { data } = context;

  data.completed = false;
  data.cacheable = false;
  data.requestedAt = new Date();
  data.createdAt = undefined;

  if (!data.quantity || data.quantity <= 0) {
    throw new BadRequest(`unable to process a quantity of ${data.quantity}`);
  }
  if (data.priceCurrency !== currencyTypeMap.USD) {
    throw new BadRequest(`only supporting priceCurrency of ${currencyTypeMap.USD}`);
  }
  switch (data.source) {
    case ThirdPartyVendorTypeMap.slant3D:
      // TODO: in later Jira task, we will actually call the Slant 3D service. For now, make something up:
      const quoteResult = {
        "message": "Slicing successful",
        "data": {
          "price": "$8.23"
        }
      }
      if (quoteResult.message !== 'Slicing successful') {
        throw new BadRequest(`did not successfully process quote: ${quoteResult.message}`);
      }
      let rawPrice = quoteResult.data?.price || '0';
      let totalPrice = Number(rawPrice.replace(/[^0-9\.-]+/g,""));
      let totalPennies = totalPrice * 100.0;
      data.pricePerUnit = Math.round(totalPennies / data.quantity);
      data.vendorResult = (quoteResult.message || 'no result returned') + `; original total ${rawPrice}`;
      break;
    default:
      throw new BadRequest(`Support for 3rd party vendor source "${data.source}" not implemented yet`);
  }
}
