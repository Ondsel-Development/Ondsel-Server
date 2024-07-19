import _ from 'lodash';
import {ThirdPartyVendorTypeMap} from "../quotes.subdocs.schema.js";
import {BadRequest} from "@feathersjs/errors";
import {currencyTypeMap} from "../../../currencies.js";

export const generateImmediateQuote = async (context) => {
  const { data } = context;

  data.completed = false;
  data.isFromCache = false;
  data.requestedAt = Date.now();
  data.createdAt = undefined;

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
