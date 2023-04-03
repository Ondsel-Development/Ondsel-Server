// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff } from 'feathers-hooks-common'
import axios from 'axios';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  modelDataValidator,
  modelPatchValidator,
  modelQueryValidator,
  modelResolver,
  modelExternalResolver,
  modelDataResolver,
  modelPatchResolver,
  modelQueryResolver
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
    events: []
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
        iff(
          context => context.data.shouldStartObjGeneration,
          startObjGeneration,
        ),
        schemaHooks.validateData(modelDataValidator),
        schemaHooks.resolveData(modelDataResolver)
      ],
      patch: [
        iff(
          context => context.data.shouldStartObjGeneration,
          startObjGeneration,
        ),
        schemaHooks.validateData(modelPatchValidator),
        schemaHooks.resolveData(modelPatchResolver),
      ],
      remove: []
    },
    after: {
      all: []
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
      id: context.id,
      fileName: fileName || data.uniqueFileName,
      command: 'CONFIGURE_MODEL',
      accessToken: params.authentication.accessToken,
      attributes: data.attributes || {}
    }
  });
  context.data.shouldStartObjGeneration = false;
  context.data.isObjGenerationInProgress = true;
  return context
};
