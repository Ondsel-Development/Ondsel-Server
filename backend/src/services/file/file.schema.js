// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators.js'


const fileVersionSchema = Type.Object({
  _id: ObjectIdSchema(),
  uniqueFileName: Type.String(),
  userId: ObjectIdSchema(),
  message: Type.Optional(Type.String()),
  createdAt: Type.Number(),
  fileUpdatedAt: Type.Optional(Type.Number()),
  additionalData: Type.Object({}),
})

// Main data model schema
export const fileSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    currentVersionId: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    versions: Type.Array(fileVersionSchema)
  },
  { $id: 'File', additionalProperties: false }
)

export const fileValidator = getValidator(fileSchema, dataValidator)
export const fileResolver = resolve({
  currentVersion: virtual(async(message, context) => {
    return message.versions.find(version => version._id.equals(message.currentVersionId) )
  })
})

export const fileExternalResolver = resolve({})

// Schema for creating new entries
export const fileDataSchema = Type.Pick(fileSchema, ['versions', 'currentVersionId'], {
  $id: 'FileData'
})
export const fileDataValidator = getValidator(fileDataSchema, dataValidator)
export const fileDataResolver = resolve({
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
})

// Schema for updating existing entries
export const filePatchSchema = Type.Partial(fileSchema, {
  $id: 'FilePatch'
})
export const filePatchValidator = getValidator(filePatchSchema, dataValidator)
export const filePatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const fileQueryProperties = Type.Pick(fileSchema, ['_id'])
export const fileQuerySchema = Type.Intersect(
  [
    querySyntax(fileQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const fileQueryValidator = getValidator(fileQuerySchema, queryValidator)
export const fileQueryResolver = resolve({})
