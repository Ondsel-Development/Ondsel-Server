// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema, StringEnum } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const runnerLogsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    modelId: ObjectIdSchema(),
    type: StringEnum(['SUCCESS', 'ERROR']),
    uniqueFileName: Type.String(),  // store s3 input file name on which runner perform operation
    createdAt: Type.Number(),
    message: Type.Optional(Type.String()),
    runnerCommand: Type.String(),
    additionalData: Type.Optional(Type.Object({})),
  },
  { $id: 'RunnerLogs', additionalProperties: false }
)
export const runnerLogsValidator = getValidator(runnerLogsSchema, dataValidator)
export const runnerLogsResolver = resolve({})

export const runnerLogsExternalResolver = resolve({})

// Schema for creating new entries
export const runnerLogsDataSchema = Type.Pick(runnerLogsSchema, [
  'modelId', 'message', 'type', 'additionalData', 'runnerCommand', 'uniqueFileName'
], {
  $id: 'RunnerLogsData'
})
export const runnerLogsDataValidator = getValidator(runnerLogsDataSchema, dataValidator)
export const runnerLogsDataResolver = resolve({
  createdAt: async () => Date.now(),
})

// Schema for updating existing entries
export const runnerLogsPatchSchema = Type.Partial(runnerLogsSchema, {
  $id: 'RunnerLogsPatch'
})
export const runnerLogsPatchValidator = getValidator(runnerLogsPatchSchema, dataValidator)
export const runnerLogsPatchResolver = resolve({})

// Schema for allowed query properties
export const runnerLogsQueryProperties = Type.Pick(runnerLogsSchema, ['_id', 'modelId', 'type', 'runnerCommand'])
export const runnerLogsQuerySchema = Type.Intersect(
  [
    querySyntax(runnerLogsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const runnerLogsQueryValidator = getValidator(runnerLogsQuerySchema, queryValidator)
export const runnerLogsQueryResolver = resolve({})
