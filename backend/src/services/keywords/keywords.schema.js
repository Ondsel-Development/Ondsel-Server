// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {keywordMatchSchema} from "./keywords.subdocs.js";

// Main data model schema
export const keywordsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    keyPhrase: Type.String(),
    // the sortedMatches array stores the top 200 but only serves the top 50. This is done to prevent an inflation attack
    sortedMatches: Type.Array(keywordMatchSchema),
  },
  { $id: 'Keywords', additionalProperties: false }
)
export const keywordsValidator = getValidator(keywordsSchema, dataValidator)
export const keywordsResolver = resolve({})

export const keywordsExternalResolver = resolve({})

// Schema for creating new entries
export const keywordsDataSchema = Type.Pick(keywordsSchema, ['text'], {
  $id: 'KeywordsData'
})
export const keywordsDataValidator = getValidator(keywordsDataSchema, dataValidator)
export const keywordsDataResolver = resolve({})

// Schema for updating existing entries
export const keywordsPatchSchema = Type.Partial(keywordsSchema, {
  $id: 'KeywordsPatch'
})
export const keywordsPatchValidator = getValidator(keywordsPatchSchema, dataValidator)
export const keywordsPatchResolver = resolve({})

// Schema for allowed query properties
export const keywordsQueryProperties = Type.Pick(keywordsSchema, ['_id', 'text'])
export const keywordsQuerySchema = Type.Intersect(
  [
    querySyntax(keywordsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const keywordsQueryValidator = getValidator(keywordsQuerySchema, queryValidator)
export const keywordsQueryResolver = resolve({})
