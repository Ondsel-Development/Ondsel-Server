// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const workspaceSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'Workspace', additionalProperties: false }
)
export const workspaceValidator = getValidator(workspaceSchema, dataValidator)
export const workspaceResolver = resolve({})

export const workspaceExternalResolver = resolve({})

// Schema for creating new entries
export const workspaceDataSchema = Type.Pick(workspaceSchema, ['text'], {
  $id: 'WorkspaceData'
})
export const workspaceDataValidator = getValidator(workspaceDataSchema, dataValidator)
export const workspaceDataResolver = resolve({})

// Schema for updating existing entries
export const workspacePatchSchema = Type.Partial(workspaceSchema, {
  $id: 'WorkspacePatch'
})
export const workspacePatchValidator = getValidator(workspacePatchSchema, dataValidator)
export const workspacePatchResolver = resolve({})

// Schema for allowed query properties
export const workspaceQueryProperties = Type.Pick(workspaceSchema, ['_id', 'text'])
export const workspaceQuerySchema = Type.Intersect(
  [
    querySyntax(workspaceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const workspaceQueryValidator = getValidator(workspaceQuerySchema, queryValidator)
export const workspaceQueryResolver = resolve({})
