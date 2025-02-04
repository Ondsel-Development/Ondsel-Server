// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { fileSummary } from '../file/file.subdocs.js';
import { directorySummary } from './directories.subdocs.js';
import { workspaceSummary } from '../workspaces/workspaces.subdocs.schema.js';

// Main data model schema
export const directorySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    parentDirectory: Type.Optional(Type.Union([Type.Null(), directorySummary])),
    workspace: workspaceSummary,
    files: Type.Array(fileSummary),
    directories: Type.Array(directorySummary),
    createdBy: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
  },
  { $id: 'Directory', additionalProperties: false }
)
export const directoryValidator = getValidator(directorySchema, dataValidator)
export const directoryResolver = resolve({})

export const directoryExternalResolver = resolve({})
export const directoryPublicFields = ['_id', 'name', 'parentDirectory', 'files', 'directories'];

// Schema for creating new entries
export const directoryDataSchema = Type.Pick(directorySchema, ['name', 'parentDirectory', 'workspace'], {
  $id: 'DirectoryData'
})
export const directoryDataValidator = getValidator(directoryDataSchema, dataValidator)
export const directoryDataResolver = resolve({
  createdBy: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  files: async () => [],
  directories: async () => [],
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
})

// Schema for updating existing entries
export const directoryPatchSchema = Type.Partial(directorySchema, {
  $id: 'DirectoryPatch'
})
export const directoryPatchValidator = getValidator(directoryPatchSchema, dataValidator)
export const directoryPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const directoryQueryProperties = Type.Pick(directorySchema, ['_id', 'name', 'deleted', 'parentDirectory', 'files', 'directories'])
export const directoryQuerySchema = Type.Intersect(
  [
    querySyntax(directoryQueryProperties),
    // Add additional query properties here
    Type.Object({
      "workspace._id": Type.Optional(ObjectIdSchema()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const directoryQueryValidator = getValidator(directoryQuerySchema, queryValidator)
export const directoryQueryResolver = resolve({})
