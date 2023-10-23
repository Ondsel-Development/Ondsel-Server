// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const directorySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'Directory', additionalProperties: false }
)
export const directoryValidator = getValidator(directorySchema, dataValidator)
export const directoryResolver = resolve({})

export const directoryExternalResolver = resolve({})

// Schema for creating new entries
export const directoryDataSchema = Type.Pick(directorySchema, ['text'], {
  $id: 'DirectoryData'
})
export const directoryDataValidator = getValidator(directoryDataSchema, dataValidator)
export const directoryDataResolver = resolve({})

// Schema for updating existing entries
export const directoryPatchSchema = Type.Partial(directorySchema, {
  $id: 'DirectoryPatch'
})
export const directoryPatchValidator = getValidator(directoryPatchSchema, dataValidator)
export const directoryPatchResolver = resolve({})

// Schema for allowed query properties
export const directoryQueryProperties = Type.Pick(directorySchema, ['_id', 'text'])
export const directoryQuerySchema = Type.Intersect(
  [
    querySyntax(directoryQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const directoryQueryValidator = getValidator(directoryQuerySchema, queryValidator)
export const directoryQueryResolver = resolve({})
