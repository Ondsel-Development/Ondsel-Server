// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff, preventChanges, softDelete } from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors';
import axios from 'axios';
import swagger from 'feathers-swagger';
import _ from 'lodash';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  modelDataValidator,
  modelPatchValidator,
  modelQueryValidator,
  modelResolver,
  modelExternalResolver,
  modelDataResolver,
  modelPatchResolver,
  modelQueryResolver,
  modelSchema,
  modelDataSchema,
  modelPatchSchema,
  modelQuerySchema,
} from './models.schema.js'
import { ModelService, getOptions } from './models.class.js'
import { modelPath, modelMethods } from './models.shared.js'

export * from './models.class.js'
export * from './models.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const model = (app) => {
  // Register our service on the Feathers application
  app.use(modelPath, new ModelService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: modelMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { modelSchema, modelDataSchema, modelPatchSchema , modelQuerySchema, },
      docs: {
        description: 'A Model service',
        idType: 'string',
        securities: ['all'],
      }
    })

  })

  app.service(modelPath).publish((data, context) => {
    return app.channel(context.result.userId.toString())
  })

  // Initialize hooks
  app.service(modelPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(modelExternalResolver),
        schemaHooks.resolveResult(modelResolver)
      ]
    },
    before: {
      all: [
        softDelete({
          deletedQuery: async context => {
            if ( context.method === 'remove') {
              const sharedModelService = context.app.service('shared-models');
              const sharedModels = await sharedModelService.find({ query: { cloneModelId: context.id, '$paginate': false }})
              for (const sharedModel of sharedModels) {
                await sharedModelService.remove(sharedModel._id);
              }
              const model = await context.service.get(context.id);
              if (model.fileId) {
                await context.app.service('file').remove(model.fileId, {$forceRemove: true, ...context.params});
              }
            }
            return { deleted: { $ne: true } };
          }
        }),
        schemaHooks.validateQuery(modelQueryValidator),
        schemaHooks.resolveQuery(modelQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        createFileVersionControlObject,
        schemaHooks.validateData(modelDataValidator),
        schemaHooks.resolveData(modelDataResolver)
      ],
      patch: [
        preventChanges(false, 'isSharedModel', 'custFileName'),
        iff(
          context => context.data.shouldCommitNewVersion,
          commitNewVersion
        ),
        iff(
          context => context.data.shouldCheckoutToVersion,
          checkoutToVersion,
        ),
        iff(
          context => context.data.shouldStartObjGeneration,
          startObjGeneration,
        ),
        iff(
          context => (
            context.data.shouldStartFCStdExport ||
            context.data.shouldStartSTEPExport ||
            context.data.shouldStartSTLExport ||
            context.data.shouldStartOBJExport
          ),
          startExport
        ),
        preventChanges(
          false,
          'uniqueFileName', 'file', 'objUrl', 'thumbnailUrl'  // Not allowed computed items
        ),
        schemaHooks.validateData(modelPatchValidator),
        schemaHooks.resolveData(modelPatchResolver),
      ],
      remove: []
    },
    after: {
      all: [],
      create: [
        iff(
          context => context.data.shouldStartObjGeneration,
          startObjGeneration,
        ),
        iff(
          context => !context.params.skipSystemGeneratedSharedModel,
          createSharedModelObject,
        ),
        iff(
          context => context.result.fileId,
          async (context) => {
            await context.app.service('file').patch(
              context.result.fileId,
              {
                modelId: context.result._id.toString(),
                isSystemGenerated: context.result.isSharedModel,
              });
          },
        )
      ],
      patch: [
        iff(
          context => context.data.isObjGenerated || context.data.isThumbnailGenerated,
          feedSystemGeneratedSharedModel,
        ),
      ]
    },
    error: {
      all: []
    }
  })
}

const startObjGeneration = async (context) => {
  if (!context.params.$triggerObjGeneration && context.id) {
    const model = await context.service.get(context.id)
    if (model.objUrl && (context.params.user.tier !== 'Premium' && context.params.user.tier !== 'Enterprise')) {
      throw new BadRequest('Please upgrade your plan to Premium or Enterprise tier');
    }
  }

  const { data, params } = context;
  let fileName = null

  if (data.uniqueFileName) {
    fileName = data.uniqueFileName;
  } else if (context.id && !context.data.uniqueFileName) {
    const result = await context.service.get(context.id);
    fileName = result.uniqueFileName;
  } else if (context.data.fileId) {
    const file = await context.app.service('file').get(context.data.fileId);
    fileName = file.currentVersion.uniqueFileName;
  } else {
    throw new BadRequest('Not able to find filename')
  }
  axios({
    method: 'post',
    url: context.app.get('fcWorkerUrl'),
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      id: context.id || context.result._id.toString(),
      fileName: fileName,
      command: 'CONFIGURE_MODEL',
      accessToken: params.authentication?.accessToken || params.accessToken,
      attributes: data.attributes || {},
      isSharedModel: context.params.query.isSharedModel,
    }
  });

  if (context.result) {
    // Update status in DB too, when shouldStartObjGeneration is true in POST endpoint
    await context.service.patch(context.result._id.toString(), { shouldStartObjGeneration: false, isObjGenerationInProgress: true });
  }

  context.data.shouldStartObjGeneration = false;
  context.data.isObjGenerationInProgress = true;
  context.data.latestLogErrorIdForObjGenerationCommand = null;
  return context
};

const startExport = async (context) => {
  if (context.params.user.tier !== 'Premium' && context.params.user.tier !== 'Enterprise') {
    throw new BadRequest('Please upgrade your plan to Premium or Enterprise tier');
  }
  const { data, params } = context
  let fileName = null
  let attributes = {}
  if (!context.data.uniqueFileName || !context.data.attributes) {
    const result = await context.service.get(context.id);
    fileName = result.uniqueFileName;
    attributes = result.attributes;
  }

  let command;
  if (data.shouldStartFCStdExport) {
    command = 'EXPORT_FCSTD';
    data['isExportFCStdGenerated'] = false;
    data['latestLogErrorIdForFcstdExportCommand'] = null;
  } else if (data.shouldStartSTEPExport) {
    command = 'EXPORT_STEP';
    data['isExportSTEPGenerated'] = false;
    data['latestLogErrorIdForStepExportCommand'] = null;
  } else if (data.shouldStartSTLExport) {
    command = 'EXPORT_STL';
    data['isExportSTLGenerated'] = false;
    data['latestLogErrorIdForStlExportCommand'] = null;
  } else {
    command = 'EXPORT_OBJ';
    data['isExportOBJGenerated'] = false;
    data['latestLogErrorIdForObjExportCommand'] = null;
  }

  axios({
    method: 'post',
    url: context.app.get('fcWorkerUrl'),
    headers: {
      'Content-Type': 'application/json'
    },
    data : {
      id: context.id || context.result._id.toString(),
      fileName: fileName || data.uniqueFileName,
      command: command,
      accessToken: params.authentication?.accessToken || params.accessToken,
      attributes: data.attributes || attributes,
      isSharedModel: context.params.query.isSharedModel,
      sharedModelId: params.sharedModelId || null,
    }
  });
  context.data = _.omit(data, ['shouldStartFCStdExport', 'shouldStartSTEPExport', 'shouldStartSTLExport', 'shouldStartOBJExport']);
  return context;
}

const createFileVersionControlObject = async context => {
  const { data } = context
  const fileService = context.app.service('file');
  if (data.uniqueFileName) {
    const file = await fileService.create({
      custFileName: data.custFileName,
      shouldCommitNewVersion: true,
      version: {
        uniqueFileName: data.uniqueFileName,
        message: 'Initial commit',
        ...(data.fileUpdatedAt && {fileUpdatedAt: data.fileUpdatedAt})
      }
    }, {authentication: context.params.authentication,});
    data['fileId'] = file._id.toString();
    context.data = _.omit(data, 'uniqueFileName', 'custFileName');
  }
  return context;
}

const saveModelAttributesToCurrentFile =  async (context, model) => {
  await context.app.service('file').patch(
    model.fileId,
    {
      shouldUpdateVersionData: true,
      version: {
        _id: model.file.currentVersion._id.toString(),
        additionalData: _.merge({}, model.file.currentVersion.additionalData, {attributes: model.attributes}),
      }
    },
  )
}

const commitNewVersion = async (context) => {
  const { data } = context;
  if (!data.version) {
    throw new BadRequest('Should include version object');
  }
  const lookUpAttributes = ['shouldCommitNewVersion', 'version'];
  const model = await context.service.get(context.id);
  if (model.fileId) {

    await context.app.service('file').patch(
      model.fileId,
      _.pick(data, lookUpAttributes),
      { authentication: context.params.authentication },
    );

    // Save latest model.attributes to file data
    await saveModelAttributesToCurrentFile(context, model)
    context.params.$triggerObjGeneration = true;
  }

  context.data['attributes'] = {}
  context.data = _.omit(data, lookUpAttributes);
  return context;
}


const checkoutToVersion = async (context) => {
  const lookUpAttributes = ['shouldCheckoutToVersion', 'versionId']
  const model = await context.service.get(context.id);
  if (model.fileId) {
    const file = await context.app.service('file').patch(
      model.fileId,
      _.pick(context.data, lookUpAttributes),
      { authentication: context.params.authentication },
    )
    // Save latest model.attributes to file data
    await saveModelAttributesToCurrentFile(context, model)

    // assign current file version attributes to model attributes
    context.data['attributes'] = file.currentVersion.additionalData.attributes || {}
    context.params.$triggerObjGeneration = true;
  }

  context.data = _.omit(context.data, lookUpAttributes);
  return context;
}


const createSharedModelObject = async (context) => {

  if (context.result.isSharedModel) {
    return context;
  }

  const sharedModelService = context.app.service('shared-models');
  const fileService = context.app.service('file');

  const originalFile = await fileService.get(context.result.fileId);

  const file = await fileService.create({
    custFileName: originalFile.custFileName,
    shouldCommitNewVersion: true,
    version: {
      uniqueFileName: originalFile.currentVersion.uniqueFileName,
    }
  }, {
    authentication: context.params.authentication,
  })

  const newModel = await context.service.create({
    fileId: file._id.toString(),
    shouldStartObjGeneration: false,
    isObjGenerationInProgress: false,
    isObjGenerated: context.result.isObjGenerated,
    errorMsg: context.result.errorMsg,
    attributes: context.result.attributes || {},
    isSharedModel: true,
    isSharedModelAnonymousType: true,
  }, {
    authentication: context.params.authentication,
  });

  const sharedModel = await sharedModelService.create({
    cloneModelId: context.result._id.toString(),
    dummyModelId: newModel._id.toString(),
    description: 'System Generated',
    isSystemGenerated: true,
    canViewModel: true,
    canViewModelAttributes: true,
    canUpdateModel: false,
    canExportFCStd: false,
    canExportSTEP: false,
    canExportSTL: false,
    canExportOBJ: false,
    canDownloadDefaultModel: true,
  }, {
    authentication: context.params.authentication,
  })

  return context;
}


const feedSystemGeneratedSharedModel = async (context) => {

  if (context.result.isSharedModel) {
    return context;
  }
  const uploadService = context.app.service('upload');
  const result = await context.app.service('shared-models').find({
    query: { isSystemGenerated: true, cloneModelId: context.id }
  })
  if (result.data.length) {
    const systemGeneratedSharedModel = result.data[0];
    const patchData = {};
    if (context.data.isObjGenerated && !systemGeneratedSharedModel.model.isObjGenerated) {
      uploadService.copy(`${context.id.toString()}_generated.OBJ`, `${systemGeneratedSharedModel.model._id.toString()}_generated.OBJ`);
      patchData['isObjGenerated'] = true;
      patchData['attributes'] = context.result.attributes;

    }
    if (context.data.isThumbnailGenerated && !systemGeneratedSharedModel.model.isThumbnailGenerated) {
      uploadService.copy(`${context.id.toString()}_thumbnail.PNG`, `${systemGeneratedSharedModel.model._id.toString()}_thumbnail.PNG`);
      patchData['isThumbnailGenerated'] = true;
    }
    if (Object.keys(patchData).length) {
      context.app.service('shared-models').patch(
        systemGeneratedSharedModel._id,
        { model: patchData },
        { authentication: context.params.authentication }
      )
    }
  }
  return context;
}
