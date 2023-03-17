// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff } from 'feathers-hooks-common'

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
          context => context.data.generateOBJ,
          runA,
          runB
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

const runA = function(context) {
  console.log('RunA trigger')
  console.log(context.data);
  delete context.data.generateOBJ;
}
const runB = function() {
  console.log('RunB trigger')
}

const startObjGeneration = function(context) {

};