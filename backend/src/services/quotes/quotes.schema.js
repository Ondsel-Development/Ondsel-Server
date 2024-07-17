// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {CurrencyType} from "../../currencies.js";
import {ThirdPartyVendorType} from "./quotes.subdocs.schema.js";
import {refNameHasher} from "../../refNameFunctions.js";

// Main data model schema
// a document in 'quotes' is a single quotation for a specific file version for a specific source
// these quotes are not "owned" be people or orgs, but are a source of data for details. It is expected
// to be used in to ways:
//  * as a source of additional detail for a specific quote stored in the `org-quotes` collection
//  * as a cache for other requests with the same conditions
// even if a quote is made on a SharedModel(ShareLink), lookup should be by fileId/versionId
export const quotesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    orderId: ObjectIdSchema(),
    completed: Type.Boolean(),           // if a true response seen from 3rd party, then this is set true; otherwise false
    originatingUserId: ObjectIdSchema(), // kept for historical reference; only a logged-in user can request a quote
    requestedAt: Type.Number(),          // the date the quote was requested
    cacheable: Type.Boolean(),           // if false, this quote CANNOT be cached because pricing is based on context;
                                         // such as the delivery address, a per-customer-discount, or an odd promotion
                                         // those details should be stored in `otherParams` or `promotion`
    isFromCache: Type.Boolean(),         // if true, then the document you are seeing came from a cache lookup
                                         // always set to true in the DB. Only is set to "true" when a CREATE sends a
                                         // cached response to the requester rather than a new doc.
    passiveDetail: Type.Any(),           // an object (empty is okay) containing details not affecting price
    vendorUrl: Type.Optional(Type.String()),
    vendorResult: Type.Optional(Type.String()), // a user readable string describing the result of the 3rd party vendor request
    // the following fields determine the "uniqueness" of the quote
    createdAt: Type.Optional(Type.Number()),    // the date the quote was RECEIVED (by 3rd pty); used for "aging" the quote
    fileId: ObjectIdSchema(),
    fileVersionId: ObjectIdSchema(),
    source: ThirdPartyVendorType,
    pricePerUnit: Type.Optional(Type.Number()), // defaults to USD cents  (USD * 100)
    priceCurrency: CurrencyType,         // defaults to 'USD' for now
    quantity: Type.Number(),
    shipping: Type.Optional(Type.Any()), // not used at first
    otherParams: Type.Any(),             // an object. only include params that affect pricing; empty object is ok
    promotion: Type.Any(),               // an object. empty object is ok
  },
  { $id: 'Quotes', additionalProperties: false }
)
export const quotesValidator = getValidator(quotesSchema, dataValidator)
export const quotesResolver = resolve({})

export const quotesExternalResolver = resolve({})

// Schema for creating new entries
export const quotesDataSchema = Type.Pick(quotesSchema, [
  // note: only the server can issue a CREATE; not an external call
  'orderId',
  `originatingUserId`,
  `cacheable`,
  `passiveDetail`,
  `fileId`,
  `fileVersionId`,
  `source`,
  `priceCurrency`,
  `quantity`,
], {
  $id: 'QuotesData'
})
export const quotesDataValidator = getValidator(quotesDataSchema, dataValidator)
export const quotesDataResolver = resolve({
  cacheable: async () => true, // TODO: make this smarter in the future
  requestedAt: async () => Date.now(),
  otherParams: async (value, _message, _context) => {
    if (value) {
      return value;
    }
    return {}
  },
  promotion: async (value, _message, _context) => {
    if (value) {
      return value;
    }
    return {}
  },
})

// Schema for updating existing entries
export const quotesPatchSchema = Type.Partial(quotesSchema, {
  $id: 'QuotesPatch'
})
export const quotesPatchValidator = getValidator(quotesPatchSchema, dataValidator)
export const quotesPatchResolver = resolve({})

// Schema for allowed query properties
export const quotesQueryProperties = Type.Pick(quotesSchema, [
  '_id',
  'createdAt',
  'fileId',
  'fileVersionId',
  'source',
  'quantity',
  'otherParams',
])
export const quotesQuerySchema = Type.Intersect(
  [
    querySyntax(quotesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const quotesQueryValidator = getValidator(quotesQuerySchema, queryValidator)
export const quotesQueryResolver = resolve({})
