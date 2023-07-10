// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver,
  userSchema,
  userDataSchema,
  userQuerySchema,
  uniqueUserValidator
} from './users.schema.js'
import { UserService, getOptions } from './users.class.js'
import { userPath, userMethods } from './users.shared.js'

export * from './users.class.js'
export * from './users.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { userDataSchema, userQuerySchema, userSchema },
      docs: {
        description: 'A User model service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(userDataValidator), schemaHooks.resolveData(userDataResolver), uniqueUserValidator],
      patch: [schemaHooks.validateData(userPatchValidator), schemaHooks.resolveData(userPatchResolver), uniqueUserValidator],
      remove: []
    },
    after: {
      all: [],
      create: [createSampleModels],
    },
    error: {
      all: []
    }
  })
}


const createSampleModels = async (context) => {
  const sampleModelFileName = 'ondsel.FCStd';
  const sampleModelObj = 'ondsel_generated.OBJ';
  const sampleModelThumbnail = 'ondsel_thumbnail.PNG';
  const attributes = {
    "Fillet1": {
      "type": "length",
      "value": 20,
      "unit": "mm"
    },
    "Fillet2": {
      "type": "length",
      "value": 5,
      "unit": "mm"
    },
    "NumberOfCircles": {
      "type": "number",
      "value": 2,
      "unit": ""
    },
    "RadialDistance": {
      "type": "length",
      "value": 1000,
      "unit": "mm"
    },
    "TangentialDistance": {
      "type": "length",
      "value": 1000,
      "unit": "mm"
    },
    "Thickness": {
      "type": "length",
      "value": 80,
      "unit": "mm"
    }
  }

  const { app } = context;
  const modelService = app.service('models');
  const fileService = app.service('file');
  const uploadService = app.service('upload');

  try {
    const file = await fileService.create({
      shouldCommitNewVersion: true,
      version: {
        uniqueFileName: sampleModelFileName,
      }
    }, { user: { _id: context.result._id }})

    const model  = await modelService.create({
      custFileName: 'Ondsel.FCStd',
      fileId: file._id.toString(),
      attributes: attributes,
      isObjGenerated: true,
      isThumbnailGenerated: true,
    }, { user: { _id: context.result._id }})

    await uploadService.copy(sampleModelThumbnail, sampleModelThumbnail.replace('ondsel', model._id.toString()));
    await uploadService.copy(sampleModelObj, sampleModelObj.replace('ondsel', model._id.toString()));
  } catch (e) {
    console.error(e);
  }

  return context
}
