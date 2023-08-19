// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import {ObjectId} from "mongodb";

// Main data model schema
export const dbMigrationSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    action: Type.String(),
    activationPIN: Type.Optional(Type.String()),
    completedOn: Type.Number(),
    completedBy: ObjectIdSchema(),
    resultMsg: Type.String(),
  },
  { $id: 'DbMigration', additionalProperties: false }
)
export const dbMigrationValidator = getValidator(dbMigrationSchema, dataValidator)
export const dbMigrationResolver = resolve({})

export const dbMigrationExternalResolver = resolve({})

// Schema for creating new entries
export const dbMigrationDataSchema = Type.Pick(dbMigrationSchema, ['action', 'activationPIN'], {
  $id: 'DbMigrationData'
})
export const dbMigrationDataValidator = getValidator(dbMigrationDataSchema, dataValidator)
export const dbMigrationDataResolver = resolve({
  _id: async () => new ObjectId(),
  completedBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  completedOn: async () => Date.now(),
  resultMsg: async () => "Internal error: db-migration never completed; nor did it record a real error.",
})

// Schema for updating existing entries
export const dbMigrationPatchSchema = Type.Partial(dbMigrationSchema, {
  $id: 'DbMigrationPatch'
})
export const dbMigrationPatchValidator = getValidator(dbMigrationPatchSchema, dataValidator)
export const dbMigrationPatchResolver = resolve({})

// Schema for allowed query properties
export const dbMigrationQueryProperties = Type.Pick(dbMigrationSchema, ['_id', 'action', 'completedBy', 'completedOn', 'resultMsg'])
export const dbMigrationQuerySchema = Type.Intersect(
  [
    querySyntax(dbMigrationQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const dbMigrationQueryValidator = getValidator(dbMigrationQuerySchema, queryValidator)
export const dbMigrationQueryResolver = resolve({})
