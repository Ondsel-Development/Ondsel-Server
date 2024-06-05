// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import _ from 'lodash';
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { NotFound } from '@feathersjs/errors';
import { dataValidator, queryValidator } from '../../validators.js'
import {curationSchema} from "../../curation.schema.js";
import { modelSchema } from '../models/models.schema.js';
import { userSummarySchema } from '../users/users.subdocs.schema.js';
import { messageSchema } from './message.schema.js';
import { ProtectionType } from './shared-models.subdocs.schema.js';
import {fileDetailSchema, VersionFollowType, VersionFollowTypeMap} from "./shared-models.subdocs.schema.js";


// Main data model schema
//
// A SharedModel is a "link", a reference, that points to a file and model/image of that file; where the meaning of
// that can vary based on usage, user, and context. It is not a model by itself; and so is sometimes called a
// ShareLink. But the legacy name is "SharedModel".
export const sharedModelsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    versionFollowing: VersionFollowType,
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
    showInPublicGallery: Type.Optional(Type.Boolean({default: false})),  // deprecated
    isThumbnailGenerated: Type.Optional(Type.Boolean({default: false})),
    thumbnailUrl: Type.String(),
    fileDetail: fileDetailSchema,
    curation: Type.Optional(curationSchema),
    messages: Type.Array(messageSchema),
    messagesParticipants: Type.Array(userSummarySchema),
    protection: ProtectionType,
    pin: Type.Optional(Type.String({ minLength: 6, maxLength: 6 })),

    // Soft delete
    deleted: Type.Optional(Type.Boolean()),

    // Store the state of cloneModelId when share link is created
    dummyModelId: Type.Optional(Type.String({ objectid: true })),

  },
  { $id: 'SharedModels', additionalProperties: false }
)

// SharedModel explaining `model`, `cloneModelId`, and `dummyModelId`
//
// - model is a Ref field, so it is not stored in the database, but is instead a placeholder for the
//   SharedModel's current 'model in context'.
//
// - cloneModelId is the official model for a logged-in user.
//   It is used when the user (if there is one) does not have a specific parameter variant to pull up instead.
//   Logged in users always see the same model BUT the S3 image shown is always pointing to the Active file version.
//
// - dummyModelId is the official model for an anonymous user.
//   It is called a "dummy" because the Model it points to is an alias, it in turn, has a `fileId` pointing to an
//   ALIAS file. These are files marked "isSystemGenerated = true"; and have no directory or workspace. They are
//   "empty mimics". They exist so that the File's version table can supply the correct `uniqueFileName` to allow an
//   S3 download.
//
//   Anonymous users see the SharedModel forever linked to the initial and first version of the file uploaded. So the
//   S3 image never updates.

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
  thumbnailUrl: virtual(async(message, context) => {
    const { app } = context;
    if (message.isThumbnailGenerated) {
      const r = await app.service('upload').get(`public/${message.dummyModelId.toString()}_thumbnail.PNG`);
      return r.url
    }
    return '';
  }),
  cloneModel: virtual(async (message, context) => {
    const modelService = context.app.service('models');
    try {
      const model = await modelService.get(message.cloneModelId);
      return _.pick(model, ['file.custFileName', 'file._id', 'file.workspace', 'file.directory', 'file.userId', 'file.createdAt']);
    } catch (error) {
      if (error instanceof NotFound) {
        return {};
      }
      if (error.message === 'next() called multiple times') {
        return {};
      }
      throw error;
    }
  }),
})

export const sharedModelsExternalResolver = resolve({
  pin: async (_v, data, context) => {
    if(!(context.params.user && context.params.user._id.equals(data.userId))) {
      return undefined;
    }
    return data.pin;
  }
})

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
  'isThumbnailGenerated',
  'protection',
  'pin',
  'versionFollowing',
], {
  $id: 'SharedModelsData'
})
export const sharedModelsDataValidator = getValidator(sharedModelsDataSchema, dataValidator)
export const sharedModelsDataResolver = resolve({
  versionFollowing: async (value, _message, _context) => {
    if (value) {
      return value;
    }
    return VersionFollowTypeMap.locked;  // default to locked
  },
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
  isThumbnailGenerated: async (_value, _message, context) => {
    if (_value) {
      return _value;
    }
    return sharedModelsDataSchema.properties.isThumbnailGenerated.default;
  },
  messages: async (_value, _message, _context) => {
    return [];
  },
  messagesParticipants: async (_value, _message, _context) => {
    return [];
  },
  fileDetail: async (value, _message, context) => {
    if (value) {
      return value;
    }
    const fileService = context.app.service('file');
    const modelService = context.app.service('models');
    let modelId = context.data.cloneModelId;
    if (!modelId) {
      modelId = context.data.dummyModelId;
    }
    const model = await modelService.get(modelId);
    const fileId = model.fileId;
    let versionId = null;
    if (context.data.versionFollowing !== VersionFollowTypeMap.active) {
      const file = await fileService.get(model.fileId);
      versionId = file.currentVersionId;
    }
    return {
      fileId: fileId,
      versionId: versionId,
    }
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
export const sharedModelsQueryProperties = Type.Pick(
  sharedModelsSchema,
  [
    '_id',
    'cloneModelId',
    'isActive',
    'deleted',
    'userId',
    'isSystemGenerated',
    'createdAt',
    'isThumbnailGenerated',
    'curation',
    'showInPublicGallery',
    'messages',
    'messagesParticipants',
    'protection',
    'pin'
  ]
)
export const sharedModelsQuerySchema = Type.Intersect(
  [
    querySyntax(sharedModelsQueryProperties),
    // Add additional query properties here
    Type.Object({
      isThumbnailGenerated: Type.Union([Type.Boolean(), Type.Object({ $exists: Type.Boolean()}, { additionalProperties: false })]),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const sharedModelsQueryValidator = getValidator(sharedModelsQuerySchema, queryValidator)
export const sharedModelsQueryResolver = resolve({
})
