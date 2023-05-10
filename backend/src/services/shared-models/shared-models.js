// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff, preventChanges, discard } from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors';
import swagger from 'feathers-swagger';

import { hooks as schemaHooks } from '@feathersjs/schema'
import _ from 'lodash';
import {
  sharedModelsDataValidator,
  sharedModelsPatchValidator,
  sharedModelsQueryValidator,
  sharedModelsResolver,
  sharedModelsExternalResolver,
  sharedModelsDataResolver,
  sharedModelsPatchResolver,
  sharedModelsQueryResolver,
  sharedModelsSchema,
  sharedModelsDataSchema,
  sharedModelsPatchSchema,
  sharedModelsQuerySchema,
} from './shared-models.schema.js'
import { SharedModelsService, getOptions } from './shared-models.class.js'
import { sharedModelsPath, sharedModelsMethods } from './shared-models.shared.js'

export * from './shared-models.class.js'
export * from './shared-models.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const sharedModels = (app) => {
  // Register our service on the Feathers application
  app.use(sharedModelsPath, new SharedModelsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sharedModelsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { sharedModelsSchema, sharedModelsDataSchema, sharedModelsPatchSchema ,sharedModelsQuerySchema },
      docs: {
        description: 'A model service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(sharedModelsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(sharedModelsExternalResolver),
        schemaHooks.resolveResult(sharedModelsResolver)
      ],
      create: [
        authenticate('jwt'),
      ],
      patch: [
        authenticate('jwt'),
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(sharedModelsQueryValidator),
        schemaHooks.resolveQuery(sharedModelsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        iff(
          context => context.data.cloneModelId,
          createClone,
        ),
        schemaHooks.validateData(sharedModelsDataValidator),
        schemaHooks.resolveData(sharedModelsDataResolver)
      ],
      patch: [
        iff(
          async context => {
            const sharedModel = await context.service.get(context.id);
            return !context.params.user._id.equals(sharedModel.userId);
          },
          preventChanges(
            false,
            'userId',
            'modelId',
            'cloneModelId',
            'canViewModel',
            'canViewModelAttributes',
            'canUpdateModel',
            'canExportModel'
          )
        ),
        iff(
          context => context.data.model,
          patchModel,
        ),
        schemaHooks.validateData(sharedModelsPatchValidator),
        schemaHooks.resolveData(sharedModelsPatchResolver)
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

const createClone = async (context) => {
  const { data } = context;
  if ( data.cloneModelId && !data.modelId ) {
    const modelService = context.app.service('models');
    const model = await modelService.get(data.cloneModelId);

    const newModel = await modelService.create({
      'uniqueFileName': model.uniqueFileName,
      'custFileName': model.custFileName,
      'shouldStartObjGeneration': true,
      'isObjGenerationInProgress': false,
      'isObjGenerated': false,
      'errorMsg': model.errorMsg,
      'attributes': model.attributes,
      'isSharedModel': true,
    }, {
      authentication: context.params.authentication,
    });
    context.data['modelId'] = newModel._id.toString();
    return context;
  }
};


const patchModel = async (context) => {
  const { data, app } = context;
  const sharedModel = await context.service.get(context.id);

  if (!sharedModel.canUpdateModel) {
    throw new BadRequest('Field `canUpdateModel` must be true');
  }

  if (data.model) {
    const modelService = app.service('models');
    await modelService.patch(
      sharedModel.modelId.toString(),
      data.model,
      {
        accessToken: context.params.authentication.accessToken,
        query: { isSharedModel: true }
      });
    context.data = _.omit(data, 'model')
  }
  return context;
}
