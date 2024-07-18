// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import {iff, isProvider, preventChanges, softDelete} from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
import mongodb from 'mongodb'
import swagger from 'feathers-swagger';
import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  feedWorkspaceAndDirectory,
  addFileToDirectory,
  ensureUniqueCustFileName,
  buildRelatedUserDetails,
  checkForReadme, checkForUpdatedReadme, checkForDeletedReadme
} from './helpers.js';
import {
  fileDataValidator,
  filePatchValidator,
  fileQueryValidator,
  fileResolver,
  fileExternalResolver,
  fileDataResolver,
  filePatchResolver,
  fileQueryResolver,
  fileSchema,
  fileDataSchema,
  filePatchSchema,
  fileQuerySchema,
  filePublicFields,
} from './file.schema.js'
import { FileService, getOptions } from './file.class.js'
import { filePath, fileMethods } from './file.shared.js'
import {copyFileBeforePatch, distributeFileDeletion, distributeFileSummaries} from "./file.distrib.js";
import {
  canUserAccessDirectoryOrFileGetMethod,
  canUserAccessDirectoryOrFilePatchMethod,
  userBelongingDirectoriesOrFiles
} from '../directories/helpers.js';
import {buildUserSummary} from "../users/users.distrib.js";
import {authenticateJwtWhenPrivate, handlePublicOnlyQuery} from "../../hooks/handle-public-info-query.js";

export * from './file.class.js'
export * from './file.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const file = (app) => {
  // Register our service on the Feathers application
  app.use(filePath, new FileService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: fileMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { fileSchema, fileDataSchema, filePatchSchema , fileQuerySchema, },
      docs: {
        description: 'A file service for file version control',
        idType: 'string',
        securities: ['all'],
        operations: {
          get: {
            "parameters": [
              {
                "description": "ObjectID of File to return",
                "in": "path",
                "name": "_id",
                "schema": {
                  "type": "string"
                },
                "required": true,
              },
              {
                "description": "If provided and set to \"true\", only public data is returned IF the corresponding workspace is open",
                "in": "query",
                "name": "publicInfo",
                "schema": {
                  "type": "string"
                },
                "required": false,
              },
            ],
          },
        }
      }
    })
  })

  app.service(filePath).publish((data, context) => {
    if (context.result.workspace) {
      return app.channel(`workspace/${context.result.workspace._id.toString()}`)
    }
  })

  // Initialize hooks
  app.service(filePath).hooks({
    around: {
      all: [
        handlePublicOnlyQuery(null),
        schemaHooks.resolveExternal(fileExternalResolver),
        schemaHooks.resolveResult(fileResolver)
      ],
      find: [authenticate('jwt')],
      get: [authenticateJwtWhenPrivate()],
      create: [authenticate('jwt')],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')],

    },
    before: {
      all: [
        iff(
          context => context.method === 'find' && context.params.query && context.params.query.hasOwnProperty('$paginate'),
          (context) => {
            context.params.paginate = context.params.query.$paginate === 'false' || context.params.query.$paginate === false;
            delete context.params.query.$paginate;
          }
        ),
        schemaHooks.validateQuery(fileQueryValidator),
        schemaHooks.resolveQuery(fileQueryResolver),
      ],
      find: [
        schemaHooks.validateQuery(fileQueryValidator),  // if not validate then $exists operator raise exception
        iff(
          isProvider('external'),
          userBelongingDirectoriesOrFiles
        ),
      ],
      get: [
        iff(
          isProvider('external'),
          canUserAccessDirectoryOrFileGetMethod,
        )
      ],
      create: [
        feedWorkspaceAndDirectory,
        iff(
          context => context.data.shouldCommitNewVersion,
            commitNewVersion
        ),
        ensureUniqueCustFileName,
        schemaHooks.validateData(fileDataValidator),
        schemaHooks.resolveData(fileDataResolver)
      ],
      patch: [
        copyFileBeforePatch,
        iff(
          isProvider('external'),
          canUserAccessDirectoryOrFilePatchMethod
        ),
        preventChanges(false, 'versions', 'currentVersionId'),
        iff(
          context => context.data.shouldCommitNewVersion,
          commitNewVersion
        ),
        iff(
          context => context.data.shouldCheckoutToVersion,
          checkoutToVersion,
        ),
        iff(
          context => context.data.shouldUpdateVersionData,
          updateVersionData,
        ),
        ensureUniqueCustFileName,
        schemaHooks.validateData(filePatchValidator),
        schemaHooks.resolveData(filePatchResolver)
      ],
      remove: [
        iff(
          isProvider('external'),
          canUserAccessDirectoryOrFilePatchMethod
        ),
        softDeleteFile
      ]
    },
    after: {
      all: [],
      create: [
        addFileToDirectory,
        checkForReadme,
      ],
      patch: [
        distributeFileSummaries,
        iff(
          context => context.$triggerLambda,
          triggerLambda
        ),
        checkForUpdatedReadme,
      ],
      remove: [
        distributeFileDeletion,
        checkForDeletedReadme,
      ]
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
    lockedSharedModels: [],
    additionalData: _.omit(context.data.version, ['uniqueFileName', 'message'])
  }

  let versions = [];
  let relatedUserDetails = [];
  if (context.id) {
    const file = await context.service.get(context.id)
    versions = file.versions
    relatedUserDetails = await buildRelatedUserDetails(context, file);
  } else {
    relatedUserDetails = [buildUserSummary(context.params.user)]
  }

  versions.push(versionData);

  // convert userId type from ObjectId to string
  _.forEach(versions, v => {
    v.userId = v.userId.toString()
  });
  context.data['versions'] = versions;
  context.data['currentVersionId'] = versionData._id;
  context.data['relatedUserDetails'] = relatedUserDetails;

  context.data = _.omit(context.data, ['shouldCommitNewVersion', 'version'])

  if (context.$triggerLambda === undefined) {
    context.$triggerLambda = true;
  }

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
  if (context.$triggerLambda === undefined) {
    context.$triggerLambda = true;
  }
  return context;
};


const updateVersionData = async (context) => {
  const { data } = context;
  if (!data.version) {
    throw new BadRequest('Pass version object')
  }

  const file = await context.service.get(context.id);
  const { versions } = file;

  _.forEach(versions, v => {
    v._id = v._id.toString()
    v.userId = v.userId.toString()
  });


  if (!versions.some((item) => item._id === data.version._id)) {
    throw new BadRequest(`Object with _id '${data.version._id}' not found in versions`);
  }

  const patchedVersions = versions.map((item) => {
    if (item._id === data.version._id) {
      return _.merge({}, item, data.version, (objValue, srcValue) => {
        // Exclude properties with keys '_id' and 'userId'
        if (objValue === item._id || objValue === item.userId) {
          return objValue;
        }
      });
    }
    return item;
  });

  data['versions'] = patchedVersions;
  context.data = _.omit(context.data, ['shouldUpdateVersionData', 'version'])
  return context;
};

const triggerLambda = async context => {
  const file = context.result;
  if (file.modelId) {
    await context.app.service('models').patch(
      file.modelId,
      {
        shouldStartObjGeneration: true,
        fileId: file._id,
        isThumbnailGenerated: false,
      },
      {
        $triggerObjGeneration: true,  // this will skip canUserUpdateModel check
        accessToken: context.params.authentication?.accessToken || null,  // needed for lambda to patch response back
      }
    )
  }
  return context;
}

const softDeleteFile = async (context) => {
  //
  // gather data before starting
  //
  const modelService = context.app.service('models');
  const sharedModelsService = context.app.service('shared-models');
  const file = await context.service.get(context.id);
  const fileId = file._id.toString();
  const modelsToDelete = await modelService.find({
    query: {
      deleted: {$ne: true},
      fileId: fileId,
    }
  });
  const sharedLinks = await sharedModelsService.find({
    paginate: false,
    pipeline: [{
      $match: {
        'fileDetail.fileId': file._id,
      }
    }]
  }) || [];
  //
  // mark the file as deleted
  //
  const fileAfterDelete = await context.service.patch(
    context.id,
    {
      deleted: true,
    }
  );
  //
  // mark all the models for all the revisions as deleted
  //
  for (const model of modelsToDelete.data) {
    // most of the time the following will silently fail and that is okay; this is mostly a "fail-safe"
    await modelService.patch(
      model._id,
      {
        deleted: true,
      }
    )
  }
  //
  // mark all the shared links for all the models as deleted
  //
  for (const link of sharedLinks) {
    await sharedModelsService.remove(link._id)
  }
  context.result = fileAfterDelete;
  return context;
}
