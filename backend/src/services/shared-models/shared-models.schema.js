// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
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
    modelId: Type.String({ objectid: true }),
    model: Type.Ref(modelSchema),
    canViewModel: Type.Boolean({default: true}),
    canViewModelAttributes: Type.Boolean({default: false}),
    canUpdateModel: Type.Boolean({default: false}),
    // export model permissions
    canExportFCStd: Type.Boolean({default: false}),
    canExportSTEP: Type.Boolean({default: false}),
    canExportSTL: Type.Boolean({default: false}),
    canExportOBJ: Type.Boolean({default: false}),
  },
  { $id: 'SharedModels', additionalProperties: false }
)
export const sharedModelsValidator = getValidator(sharedModelsSchema, dataValidator)
export const sharedModelsResolver = resolve({
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now(),
  model: virtual(async (message, context) => {
    // Associate the user that sent the message
    if (message.canViewModel && message.modelId) {
      const m = await context.app.service('models').get(message.modelId);
      if (!(message.canUpdateModel || message.canViewModelAttributes)) {
        return _.omit(m, 'attributes')
      }
      return m;
    }
   // return context.app.service('models').get(message.modelId);
  }),
})

export const sharedModelsExternalResolver = resolve({})

// Schema for creating new entries
export const sharedModelsDataSchema = Type.Pick(sharedModelsSchema, [
  'cloneModelId',
  'modelId',
  'canViewModel',
  'canViewModelAttributes',
  'canUpdateModel',
  'canExportModel',
], {
  $id: 'SharedModelsData'
})
export const sharedModelsDataValidator = getValidator(sharedModelsDataSchema, dataValidator)
export const sharedModelsDataResolver = resolve({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
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
export const sharedModelsQueryProperties = Type.Pick(sharedModelsSchema, ['_id', 'modelId'])
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
