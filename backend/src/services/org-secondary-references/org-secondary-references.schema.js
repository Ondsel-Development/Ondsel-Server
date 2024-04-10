// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js';
import { bookmarkSchema } from './bookmark.schema.js';

// Main data model schema
export const orgSecondaryReferencesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    organizationId: ObjectIdSchema(),
    bookmarks: Type.Array(bookmarkSchema),
  },
  { $id: 'OrgSecondaryReferences', additionalProperties: false }
)
export const orgSecondaryReferencesValidator = getValidator(orgSecondaryReferencesSchema, dataValidator)
export const orgSecondaryReferencesResolver = resolve({})

export const orgSecondaryReferencesExternalResolver = resolve({})

// Schema for creating new entries
export const orgSecondaryReferencesDataSchema = Type.Pick(orgSecondaryReferencesSchema, ['organizationId'], {
  $id: 'OrgSecondaryReferencesData'
})
export const orgSecondaryReferencesDataValidator = getValidator(
  orgSecondaryReferencesDataSchema,
  dataValidator
)
export const orgSecondaryReferencesDataResolver = resolve({
  bookmarks: async (_value, _message, _context) => {
    return [];
  }
})

// Schema for updating existing entries
export const orgSecondaryReferencesPatchSchema = Type.Partial(orgSecondaryReferencesSchema, {
  $id: 'OrgSecondaryReferencesPatch'
})
export const orgSecondaryReferencesPatchValidator = getValidator(
  orgSecondaryReferencesPatchSchema,
  dataValidator
)
export const orgSecondaryReferencesPatchResolver = resolve({})

// Schema for allowed query properties
export const orgSecondaryReferencesQueryProperties = Type.Pick(orgSecondaryReferencesSchema, ['_id', 'text'])
export const orgSecondaryReferencesQuerySchema = Type.Intersect(
  [
    querySyntax(orgSecondaryReferencesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const orgSecondaryReferencesQueryValidator = getValidator(
  orgSecondaryReferencesQuerySchema,
  queryValidator
)
export const orgSecondaryReferencesQueryResolver = resolve({})
