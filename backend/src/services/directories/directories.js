// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';

import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, preventChanges, disallow, isProvider } from 'feathers-hooks-common';
import { addFilesToDirectory } from './commands/addFilesToDirectory.js';
import { removeFilesFromDirectory } from './commands/removeFilesFromDirectory.js';
import { addDirectoriesToDirectory } from './commands/addDirectoriesToDirectory.js';
import { removeDirectoriesFromDirectory } from './commands/removeDirectoriesFromDirectory.js';
import {
  directoryDataValidator,
  directoryPatchValidator,
  directoryQueryValidator,
  directoryResolver,
  directoryExternalResolver,
  directoryDataResolver,
  directoryPatchResolver,
  directoryQueryResolver,
  directorySchema,
  directoryDataSchema,
  directoryPatchSchema,
  directoryQuerySchema
} from './directories.schema.js'
import { DirectoryService, getOptions } from './directories.class.js'
import { directoryPath, directoryMethods } from './directories.shared.js'
import {
  canUserAccessDirectoryOrFileGetMethod,
  userBelongingDirectoriesOrFiles,
  canUserAccessDirectoryOrFilePatchMethod, isDirectoryReadyToDelete, handleAddRelatedUserDetailsQuery, ifNeededAddRelatedUserDetails
} from './helpers.js';
import {distributeDirectoryDeletion} from "./directories.distrib.js";

export * from './directories.class.js'
export * from './directories.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const directory = (app) => {
  // Register our service on the Feathers application
  app.use(directoryPath, new DirectoryService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: directoryMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { directorySchema, directoryDataSchema, directoryPatchSchema , directoryQuerySchema, },
      docs: {
        description: 'A directory service',
        idType: 'string',
        securities: ['all'],
        operations: {
          get: {
            "parameters": [
              {
                "description": "ObjectID of Directory to return",
                "in": "path",
                "name": "_id",
                "schema": {
                  "type": "string"
                },
                "required": true,
              },
              {
                "description": "If provided and set to \"true\", a \"relatedUserDetails\" array of user summaries is added",
                "in": "query",
                "name": "addRelatedUserDetails",
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

  app.service(directoryPath).publish((data, context) => {
    return app.channel(`workspace/${context.result.workspace._id.toString()}`)
  })

  // Initialize hooks
  app.service(directoryPath).hooks({
    around: {
      all: [
        handleAddRelatedUserDetailsQuery(),
        authenticate('jwt'),
        schemaHooks.resolveExternal(directoryExternalResolver),
        schemaHooks.resolveResult(directoryResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(directoryQueryValidator),
        schemaHooks.resolveQuery(directoryQueryResolver)
      ],
      find: [
        iff(
          isProvider('external'),
          userBelongingDirectoriesOrFiles
        )
      ],
      get: [
        iff(
          isProvider('external'),
          canUserAccessDirectoryOrFileGetMethod,
        )
      ],
      create: [
        schemaHooks.validateData(directoryDataValidator),
        schemaHooks.resolveData(directoryDataResolver)
      ],
      patch: [
        iff(
          isProvider('external'),
          canUserAccessDirectoryOrFilePatchMethod
        ),
        iff(
          isProvider('external'),
          preventChanges(false, 'workspace', 'files', 'directories'),
        ),
        iff(
          context => context.data.shouldAddFilesToDirectory,
          addFilesToDirectory
        ),
        iff(
          context => context.data.shouldRemoveFilesFromDirectory,
          removeFilesFromDirectory
        ),
        iff(
          context => context.data.shouldAddDirectoriesToDirectory,
          addDirectoriesToDirectory
        ),
        iff(
          context => context.data.shouldRemoveDirectoriesFromDirectory,
          removeDirectoriesFromDirectory,
        ),
        schemaHooks.validateData(directoryPatchValidator),
        schemaHooks.resolveData(directoryPatchResolver)
      ],
      remove: [
        iff(isProvider('external'), canUserAccessDirectoryOrFilePatchMethod),
        iff(isProvider('external'), isDirectoryReadyToDelete),
      ]
    },
    after: {
      all: [],
      get: [
        ifNeededAddRelatedUserDetails,
      ],
      remove: [
        distributeDirectoryDeletion,
      ]
    },
    error: {
      all: []
    }
  })
}
