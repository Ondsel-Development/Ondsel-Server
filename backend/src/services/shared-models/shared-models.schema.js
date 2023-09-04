// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { NotFound } from '@feathersjs/errors';
import { dataValidator, queryValidator } from '../../validators.js'
import { modelSchema} from '../models/models.schema.js';

// Main data model schema
export const sharedModelsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    userId: Type.String({ objectid: true }),
    cloneModelId: Type.String({ objectid: true }),
    model: Type.Ref(modelSchema),
    description: Type.String({ maxLength: 20 }),
    canViewModel: Type.Boolean({default: true}),
    canViewModelAttributes: Type.Boolean({default: false}),
    canUpdateModel: Type.Boolean({default: false}),
    // export model permissions
    canExportFCStd: Type.Boolean({default: false}),
    canExportSTEP: Type.Boolean({default: false}),
    canExportSTL: Type.Boolean({default: false}),
    canExportOBJ: Type.Boolean({default: false}),
    canDownloadDefaultModel: Type.Boolean({default: false}),
    isActive: Type.Boolean({default: true}),
    isSystemGenerated: Type.Optional(Type.Boolean({default: false})),
    // Soft delete
    deleted: Type.Optional(Type.Boolean()),

    // Store the state of cloneModelId when share link is created
    dummyModelId: Type.Optional(Type.String({ objectid: true })),
  },
  { $id: 'SharedModels', additionalProperties: false }
)
export const sharedModelsValidator = getValidator(sharedModelsSchema, dataValidator)
export const sharedModelsResolver = resolve({
  model: virtual(async (message, context) => {
    if (message.canViewModel && message.dummyModelId) {
      const modelService = context.app.service('models');
      if (context.params.user) {
        const result = await modelService.find({ query: { sharedModelId: message._id, userId: context.params.user._id, isSharedModelAnonymousType: false }});
        if (result.data.length) {
          if (!(message.canUpdateModel || message.canViewModelAttributes)) {
            return _.omit(result.data[0], 'attributes')
          }
          return result.data[0];
        }
      }

      // When anonymous user access share model to view the model
      try {
        const m = await modelService.get(message.dummyModelId);
        if (!(message.canUpdateModel || message.canViewModelAttributes)) {
          return _.omit(m, 'attributes')
        }
        return m;
      } catch (error) {
        if (error instanceof NotFound) {
          return null; // Return null if no record is found
        }
        throw error; // Rethrow the error for other types of errors
      }
    }
  }),
  thumbnailUrl: virtual(async (message, context) => {
    if (message.dummyModelId) {
      const model = await context.app.service('models').get(message.dummyModelId, { query: { isSharedModel: true }, authentication: context.params.authentication });
      return model.thumbnailUrl
    }
    return '';
  }),
})

export const sharedModelsExternalResolver = resolve({})

// Schema for creating new entries
export const sharedModelsDataSchema = Type.Pick(sharedModelsSchema, [
  'cloneModelId',
  'description',
  'canViewModel',
  'canViewModelAttributes',
  'canUpdateModel',
  'canExportFCStd',
  'canExportSTEP',
  'canExportSTL',
  'canExportOBJ',
  'canDownloadDefaultModel',
  'dummyModelId',
  'isSystemGenerated',
], {
  $id: 'SharedModelsData'
})
export const sharedModelsDataValidator = getValidator(sharedModelsDataSchema, dataValidator)
export const sharedModelsDataResolver = resolve({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  // Initialize default values
  // https://github.com/feathersjs/feathers/issues/2837
  canViewModel: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canViewModel.default
  },
  canViewModelAttributes: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canViewModelAttributes.default
  },
  canUpdateModel: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canUpdateModel.default
  },
  canExportFCStd: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canExportFCStd.default
  },
  canExportSTEP: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canExportSTEP.default
  },
  canExportSTL: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canExportSTL.default
  },
  canExportOBJ: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canExportOBJ.default
  },
  canDownloadDefaultModel: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.canDownloadDefaultModel.default
  },
  isActive: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.isActive.default
  },
  isSystemGenerated: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsSchema.properties.isSystemGenerated.default
  },
})

// Schema for updating existing entries
export const sharedModelsPatchSchema = Type.Partial(sharedModelsSchema, {
  $id: 'SharedModelsPatch'
})
export const sharedModelsPatchValidator = getValidator(sharedModelsPatchSchema, dataValidator)
export const sharedModelsPatchResolver = resolve({
  updatedAt: async () => Date.now(),
})

// Schema for allowed query properties
export const sharedModelsQueryProperties = Type.Pick(sharedModelsSchema, [
  '_id',
  'cloneModelId',
  'isActive',
  'deleted',
  'userId',
  'isSystemGenerated',
  'createdAt',
  'updatedAt',
  'canViewModel',
])
export const sharedModelsQuerySchema = Type.Intersect(
  [
    querySyntax(sharedModelsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const sharedModelsQueryValidator = getValidator(sharedModelsQuerySchema, queryValidator)
export const sharedModelsQueryResolver = resolve({
})
