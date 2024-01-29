// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSchema } from '../users/users.schema.js'
import { fileSchema } from '../file/file.schema.js';
import { NotFound } from '@feathersjs/errors'


export const logErrorIdType = Type.Optional(Type.Union([ObjectIdSchema(), Type.Null()]))

// Main data model schema
export const modelSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: Type.String({ objectid: true }),
    user: Type.Ref(userSchema),
    uniqueFileName: Type.Optional(Type.String()),  // deprecated because we are using file object
    fileId: ObjectIdSchema(),
    file: Type.Ref(fileSchema),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    fileUpdatedAt: Type.Optional(Type.Number()),
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

    sharedModelId: Type.Optional(Type.String({ objectid: true })),
    isSharedModelAnonymousType: Type.Optional(Type.Boolean({default: false})),
    // Soft delete
    deleted: Type.Optional(Type.Boolean()),
    // latest runner log for each command if lambda crashes midway
    latestLogErrorIdForObjGenerationCommand: logErrorIdType,
    latestLogErrorIdForFcstdExportCommand: logErrorIdType,
    latestLogErrorIdForStepExportCommand: logErrorIdType,
    latestLogErrorIdForStlExportCommand: logErrorIdType,
    latestLogErrorIdForObjExportCommand: logErrorIdType,
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
      let r = await app.service('upload').get(`${message._id.toString()}_generated.BREP`);
      if (!r.url) {
        r = await app.service('upload').get(`${message._id.toString()}_generated.OBJ`);
      }
      return r.url
    }
    return '';
  }),
  thumbnailUrl: virtual(async(message, context) => {
    const { app } = context;
    if (message.isThumbnailGenerated) {
      const r = await app.service('upload').get(`public/${message._id.toString()}_thumbnail.PNG`);
      return r.url
    }
    return '';
  }),
  file: virtual(async (message, context) => {
    const { app } = context;
    const fileService = app.service('file');
    if (message.fileId) {
      try {
        return await fileService.get(message.fileId);
      } catch (error) {
        if (error instanceof NotFound) {
          return null; // Return null if no record is found
        }
      }
    }
  }),
  uniqueFileName: virtual(async(message, context ) => {
    if (message.uniqueFileName) {
      return message.uniqueFileName
    } else if (message.fileId) {
      try {
        const file = await context.app.service('file').get(message.fileId);
        return file.currentVersion.uniqueFileName;
      } catch (error) {
        if (error instanceof NotFound) {
          return null; // Return null if no record is found
        }
      }
    }
  }),
  haveWriteAccess: virtual(async (_message, context) => {
    return !context.$isModelBelongsToOpenWorkspace;
  })
})

export const modelExternalResolver = resolve({})

// Schema for creating new entries
export const modelDataSchema = Type.Pick(modelSchema, [
  'uniqueFileName',
  'shouldStartObjGeneration',
  'isObjGenerationInProgress',
  'isObjGenerated',
  'isThumbnailGenerated',
  'attributes',
  'errorMsg',
  'isSharedModel',
  'sharedModelId',
  'isSharedModelAnonymousType',
  'fileUpdatedAt',
  'fileId',
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
    if (_value) {
      return _value;
    }
    return modelSchema.properties.isObjGenerated.default;
  },
  isSharedModel: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return modelSchema.properties.isSharedModel.default;
  },
  isSharedModelAnonymousType: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return modelSchema.properties.isSharedModelAnonymousType.default;
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
  [
    '_id',
    'uniqueFileName',
    'fileId',
    'createdAt',
    'updatedAt',
    'isSharedModel',
    'sharedModelId',
    'userId',
    'isSharedModelAnonymousType',
    'deleted',
    'attributes',
    'objUrl',
    'isObjGenerated'
  ]
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
export const modelQueryResolver = resolve({})
