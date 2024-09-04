// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {PublishedFileIdentityType} from "./publisher.subdocs.schema.js";

// Main data model schema
export const publisherSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    identity: PublishedFileIdentityType,
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    releaseDate: Type.Number(),
    release: Type.Optional(Type.String()),
  },
  { $id: 'Publisher', additionalProperties: false }
)
export const publisherValidator = getValidator(publisherSchema, dataValidator)
export const publisherResolver = resolve({})

export const publisherExternalResolver = resolve({})

// Schema for creating new entries
export const publisherDataSchema = Type.Pick(publisherSchema, ['text'], {
  $id: 'PublisherData'
})
export const publisherDataValidator = getValidator(publisherDataSchema, dataValidator)
export const publisherDataResolver = resolve({})

// Schema for updating existing entries
export const publisherPatchSchema = Type.Partial(publisherSchema, {
  $id: 'PublisherPatch'
})
export const publisherPatchValidator = getValidator(publisherPatchSchema, dataValidator)
export const publisherPatchResolver = resolve({})

// Schema for allowed query properties
export const publisherQueryProperties = Type.Pick(publisherSchema, ['_id', 'text'])
export const publisherQuerySchema = Type.Intersect(
  [
    querySyntax(publisherQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const publisherQueryValidator = getValidator(publisherQuerySchema, queryValidator)
export const publisherQueryResolver = resolve({})
