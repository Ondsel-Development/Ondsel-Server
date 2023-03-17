// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSchema } from '../users/users.schema.js'


// Main data model schema
export const modelSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: Type.String({ objectid: true }),
    user: Type.Ref(userSchema),
    custFileName: Type.String(),
    uniqueFileName: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    StatusLine: Type.Optional(
      Type.Object({
        isObjGenerationInProgress: Type.Optional(Type.Boolean({default: false})),
        isObjGenerated: Type.Optional(Type.Boolean({default: false})),
      })
    ),
    shouldStartObjGeneration: Type.Optional(Type.String()),
    errorMsg: Type.String(),
  },
  { $id: 'Model', additionalProperties: false }
)


export const modelValidator = getValidator(modelSchema, dataValidator)
export const modelResolver = resolve({
  // user: virtual(async (message, context) => {
  //   // Associate the user that sent the message
  //   return context.app.service('users').get(message.userId)
  // })
})

export const modelExternalResolver = resolve({})

// Schema for creating new entries
export const modelDataSchema = Type.Pick(modelSchema, ['uniqueFileName', 'custFileName', 'StatusLine'], {
  $id: 'ModelData'
})
export const modelDataValidator = getValidator(modelDataSchema, dataValidator)
export const modelDataResolver = resolve({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  StatusLine: async (_value, _message, context) => {
    // https://github.com/feathersjs/feathers/issues/2837
    return {
      isObjGenerationInProgress: modelSchema.properties.StatusLine.properties.isObjGenerationInProgress.default,
      isObjGenerated: modelSchema.properties.StatusLine.properties.isObjGenerated.default,
    }
  }
})

// Schema for updating existing entries
export const modelPatchSchema = Type.Partial(modelSchema, {
  $id: 'ModelPatch'
})
export const modelPatchValidator = getValidator(modelPatchSchema, dataValidator)
export const modelPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const modelQueryProperties = Type.Pick(
  modelSchema,
  ['_id', 'uniqueFileName', 'custFileName', 'createdAt', 'updatedAt']
)
export const modelQuerySchema = Type.Intersect(
  [
    querySyntax(modelQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const modelQueryValidator = getValidator(modelQuerySchema, queryValidator)
export const modelQueryResolver = resolve({
  userId: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user._id
    }

    return value
  },
})
