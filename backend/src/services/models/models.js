// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff, preventChanges } from 'feathers-hooks-common'
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
      all: [schemaHooks.validateQuery(modelQueryValidator), schemaHooks.resolveQuery(modelQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(modelDataValidator),
        schemaHooks.resolveData(modelDataResolver)
      ],
      patch: [
        preventChanges(false, 'isSharedModel'),
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
      ]
    },
    error: {
      all: []
    }
  })
}

const startObjGeneration = async (context) => {
  const { data, params } = context;
  let fileName = null
  if (!context.data.uniqueFileName) {
    const result = await context.service.get(context.id);
    fileName = result.uniqueFileName;
  }
  axios({
    method: 'post',
    url: context.app.get('fcWorkerUrl'),
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      id: context.id || context.result._id.toString(),
      fileName: fileName || data.uniqueFileName,
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
  return context
};

const startExport = async (context) => {
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
  } else if (data.shouldStartSTEPExport) {
    command = 'EXPORT_STEP';
    data['isExportSTEPGenerated'] = false;
  } else if (data.shouldStartSTLExport) {
    command = 'EXPORT_STL';
    data['isExportSTLGenerated'] = false;
  } else {
    command = 'EXPORT_OBJ';
    data['isExportOBJGenerated'] = false;
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
