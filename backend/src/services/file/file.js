// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { iff, preventChanges } from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
import mongodb from 'mongodb'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  fileDataValidator,
  filePatchValidator,
  fileQueryValidator,
  fileResolver,
  fileExternalResolver,
  fileDataResolver,
  filePatchResolver,
  fileQueryResolver,
} from './file.schema.js'
import { FileService, getOptions } from './file.class.js'
import { filePath, fileMethods } from './file.shared.js'

export * from './file.class.js'
export * from './file.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const file = (app) => {
  // Register our service on the Feathers application
  app.use(filePath, new FileService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: fileMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(filePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(fileExternalResolver),
        schemaHooks.resolveResult(fileResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(fileQueryValidator), schemaHooks.resolveQuery(fileQueryResolver)],
      find: [],
      get: [],
      create: [
        iff(
          context => context.data.shouldCommitNewVersion,
            commitNewVersion
        ),
        schemaHooks.validateData(fileDataValidator),
        schemaHooks.resolveData(fileDataResolver)
      ],
      patch: [
        preventChanges(false, 'versions', 'currentVersionId'),
        iff(
          context => context.data.shouldCommitNewVersion,
          commitNewVersion
        ),
        iff(
          context => context.data.shouldCheckoutToVersion,
          checkoutToVersion,
        ),
        schemaHooks.validateData(filePatchValidator),
        schemaHooks.resolveData(filePatchResolver)
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

const commitNewVersion = async (context) => {

  if (!context.data.version) {
    throw new BadRequest('Should include version object');
  }

  const versionData = {
    _id: (new mongodb.ObjectId()).toString(),
    createdAt: Date.now(),
    uniqueFileName: context.data.version.uniqueFileName,
    message: context.data.version.message || '',
    userId: context.params.user._id,
    additionalData: _.omit(context.data.version, ['uniqueFileName', 'message'])
  }

  let versions = [];
  if (context.id) {
    const file = await context.service.get(context.id)
    versions = file.versions
  }

  versions.push(versionData);

  // convert userId type from ObjectId to string
  _.forEach(versions, v => {
    v.userId = v.userId.toString()
  });
  context.data['versions'] = versions;
  context.data['currentVersionId'] = versionData._id;

  context.data = _.omit(context.data, ['shouldCommitNewVersion', 'version'])

  return context;
};


const checkoutToVersion = async (context) => {
  if (!context.data.versionId) {
    throw new BadRequest('Pass versionId to checkout')
  }

  const file = await context.service.get(context.id);
  if (!file.versions.some(version => version._id.toString() === context.data.versionId)){
    throw new BadRequest('Given versionId not exist, pass valid versionId')
  }

  context.data['currentVersionId'] = context.data.versionId
  context.data = _.omit(context.data, ['shouldCheckoutToVersion', 'versionId'])
  return context;
};
