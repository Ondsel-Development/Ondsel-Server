// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators.js'
import { directorySummary } from '../directories/directories.subdocs.js';
import { workspaceSummary } from '../workspaces/workspaces.subdocs.schema.js';
import { modelSummarySchema } from "../models/models.distrib.js";

export const fileVersionSchema = Type.Object({
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
    custFileName: Type.String(),
    currentVersionId: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    modelId: Type.Optional(ObjectIdSchema()),
    model: modelSummarySchema,
    isSystemGenerated: Type.Optional(Type.Boolean({default: false})),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    versions: Type.Array(fileVersionSchema),
    directory: Type.Optional(Type.Union([Type.Null(), directorySummary])),
    workspace: Type.Optional(workspaceSummary),
    // Soft delete
    deleted: Type.Optional(Type.Boolean()),
  },
  { $id: 'File', additionalProperties: false }
)

export const fileValidator = getValidator(fileSchema, dataValidator)
export const fileResolver = resolve({
  currentVersion: virtual(async(message, _context) => {
    if (message.versions && message.currentVersionId ) {
      return message.versions.find(version => version._id.equals(message.currentVersionId) )
    }
  })
})

export const fileExternalResolver = resolve({})

// Schema for creating new entries
export const fileDataSchema = Type.Pick(fileSchema, ['versions', 'currentVersionId', 'modelId', 'isSystemGenerated', 'custFileName', 'workspace', 'directory'], {
  $id: 'FileData'
})
export const fileDataValidator = getValidator(fileDataSchema, dataValidator)
export const fileDataResolver = resolve({
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  isSystemGenerated: async (_value, _message, _context) => {
    if (_value) {
      return _value;
    }
    return fileSchema.properties.isSystemGenerated.default
  }
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
export const fileQueryProperties = Type.Pick(fileSchema, ['_id', 'userId', 'currentVersionId', 'modelId', 'isSystemGenerated', 'custFileName', 'deleted'])
export const fileQuerySchema = Type.Intersect(
  [
    querySyntax(fileQueryProperties, {
      modelId: {
        $exists: Type.Boolean(),
      },
    }),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const fileQueryValidator = getValidator(fileQuerySchema, queryValidator)
export const fileQueryResolver = resolve({})
