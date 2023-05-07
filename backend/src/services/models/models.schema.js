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
    isObjGenerationInProgress: Type.Optional(Type.Boolean({default: false})),
    isObjGenerated: Type.Optional(Type.Boolean({default: false})),
    shouldStartObjGeneration: Type.Optional(Type.Boolean()),
    attributes: Type.Optional(Type.Object({})),
    errorMsg: Type.Optional(Type.String()),
    objUrl: Type.String(),
    isSharedModel: Type.Optional(Type.Boolean({default: false})),
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.String(),
    isExportFCStdGenerated: Type.Optional(Type.Boolean({default: false})),
    isExportSTEPGenerated: Type.Optional(Type.Boolean({default: false})),
    isExportSTLGenerated: Type.Optional(Type.Boolean({default: false})),
    isExportOBJGenerated: Type.Optional(Type.Boolean({default: false})),
  },
  { $id: 'Model', additionalProperties: false }
)


export const modelValidator = getValidator(modelSchema, dataValidator)
export const modelResolver = resolve({
  // user: virtual(async (message, context) => {
  //   // Associate the user that sent the message
  //   return context.app.service('users').get(message.userId)
  // })
  objUrl: virtual(async(message, context) => {
    const { app } = context;
    if (message.isObjGenerated) {
      const r = await app.service('upload').get(`${message._id.toString()}_generated.OBJ`);
      return r.url
    }
    return '';
  }),
  thumbnailUrl: virtual(async(message, context) => {
    const { app } = context;
    if (message.isThumbnailGenerated) {
      const r = await app.service('upload').get(`${message._id.toString()}_thumbnail.PNG`);
      return r.url
    }
    return '';
  }),
})

export const modelExternalResolver = resolve({})

// Schema for creating new entries
export const modelDataSchema = Type.Pick(modelSchema, [
  'uniqueFileName',
  'custFileName',
  'shouldStartObjGeneration',
  'isObjGenerationInProgress',
  'isObjGenerated',
  'attributes',
  'errorMsg',
  'isSharedModel'
], {
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
  // https://github.com/feathersjs/feathers/issues/2837
  isObjGenerationInProgress: async (_value, _message, context) => {
    return modelSchema.properties.isObjGenerationInProgress.default
  },
  isObjGenerated: async (_value, _message, context) => {
    return modelSchema.properties.isObjGenerated.default;
  },
  isSharedModel: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return modelSchema.properties.isSharedModel.default;
  },
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
  ['_id', 'uniqueFileName', 'custFileName', 'createdAt', 'updatedAt', 'isSharedModel']
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
    if (!context.params.query.isSharedModel && context.params.user) {
      return context.params.user._id
    }
    return value
  },
})
