// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff, preventChanges, discard, softDelete } from 'feathers-hooks-common'
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
        softDelete(),
        iff(
          context => context.method === 'find' && context.params.query && context.params.query.hasOwnProperty('$paginate'),
          (context) => {
            context.params.paginate = context.params.query.$paginate === 'false' || context.params.query.$paginate === false;
            delete context.params.query.$paginate;
          }
        ),
        schemaHooks.validateQuery(sharedModelsQueryValidator),
        schemaHooks.resolveQuery(sharedModelsQueryResolver)
      ],
      find: [],
      get: [
        iff(
          context => context.params.authentication,
          authenticate('jwt'),
          ),
      ],
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
            return context.params.user && !context.params.user._id.equals(sharedModel.userId);
          },
          preventChanges(
            false,
            'userId',
            'cloneModelId',
            'canViewModel',
            'canViewModelAttributes',
            'canUpdateModel',
            'canExportModel',
            'dummyModelId',
          )
        ),

        iff(
          context => context.data.shouldCreateInstance,
          createUserInstance,
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
  if ( data.cloneModelId ) {
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
    context.data['dummyModelId'] = newModel._id.toString();
    return context;
  }
};


const patchModel = async (context) => {
  const { data, app } = context;
  const sharedModel = await context.service.get(context.id, { authentication: context.params.authentication });

  if (sharedModel.dummyModelId.equals(sharedModel.model._id)) {
    throw new BadRequest('Before patching to model, first create a instance');
  }

  if (data.model.attributes && !sharedModel.canUpdateModel) {
    throw new BadRequest('Field `canUpdateModel` must be true');
  }

  const modelService = app.service('models');
  if (data.model.shouldStartObjGeneration && data.model.attributes) {
    await modelService.patch(
      sharedModel.model._id.toString(),
      data.model,
      {
        accessToken: context.params.authentication?.accessToken || null,
        query: { isSharedModel: true }
      });
  }

  const callExport = async () => {
    await modelService.patch(
      sharedModel.model._id.toString(),
      data.model,
      {
        accessToken: context.params.authentication?.accessToken || null,
        query: { isSharedModel: true },
        sharedModelId: context.id
      });
  }

  if (data.model.shouldStartFCStdExport) {
    if (sharedModel.canExportFCStd ) {
      await callExport();
    } else {
      throw new BadRequest('Field `canExportFCStd` must be true');
    }
  }
  if (data.model.shouldStartSTEPExport) {
    if (sharedModel.canExportSTEP ) {
      await callExport();
    } else {
      throw new BadRequest('Field `canExportSTEP` must be true');
    }
  }
  if (data.model.shouldStartSTLExport) {
    if (sharedModel.canExportSTL) {
      await callExport();
    } else {
      throw new BadRequest('Field `canExportSTL` must be true');
    }
  }
  if (data.model.shouldStartOBJExport) {
    if (sharedModel.canExportOBJ) {
      await callExport();
    } else {
      throw new BadRequest('Field `canExportOBJ` must be true');
    }
  }

  if (
    data.model.isExportFCStdGenerated ||
    data.model.isExportSTEPGenerated ||
    data.model.isExportSTLGenerated ||
    data.model.isExportOBJGenerated
  ) {
    await modelService.patch(
      sharedModel.model._id.toString(),
      data.model,
      {},
    );
  }

  context.data = _.omit(data, 'model')
  return context;
}

const createUserInstance = async (context) => {
  const { data, app } = context;
  const modelService = app.service('models');
  const result = await modelService.find({ query: { sharedModelId: context.id, userId: context.params.user._id }});
  if (!result.data.length) {
    const sharedModel = await context.service.get(context.id);
    const dummyModel = await modelService.get(sharedModel.dummyModelId);

    await modelService.create({
      'uniqueFileName': dummyModel.uniqueFileName,
      'custFileName': dummyModel.custFileName,
      'shouldStartObjGeneration': true,
      'isObjGenerationInProgress': false,
      'isObjGenerated': false,
      'errorMsg': dummyModel.errorMsg,
      'attributes': dummyModel.attributes,
      'isSharedModel': true,
      'sharedModelId': context.id.toString(),
    }, {
      authentication: context.params.authentication,
    });
  }

  context.data = _.omit(data, 'shouldCreateInstance');
}
