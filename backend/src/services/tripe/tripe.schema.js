// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const tripeSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'Tripe', additionalProperties: false }
)
export const tripeValidator = getValidator(tripeSchema, dataValidator)
export const tripeResolver = resolve({})

export const tripeExternalResolver = resolve({})

// Schema for creating new entries
export const tripeDataSchema = Type.Pick(tripeSchema, ['text'], {
  $id: 'TripeData'
})
export const tripeDataValidator = getValidator(tripeDataSchema, dataValidator)
export const tripeDataResolver = resolve({})

// Schema for updating existing entries
export const tripePatchSchema = Type.Partial(tripeSchema, {
  $id: 'TripePatch'
})
export const tripePatchValidator = getValidator(tripePatchSchema, dataValidator)
export const tripePatchResolver = resolve({})

// Schema for allowed query properties
export const tripeQueryProperties = Type.Pick(tripeSchema, ['_id', 'text'])
export const tripeQuerySchema = Type.Intersect(
  [
    querySyntax(tripeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const tripeQueryValidator = getValidator(tripeQuerySchema, queryValidator)
export const tripeQueryResolver = resolve({})
