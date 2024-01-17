// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';

import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, preventChanges, disallow, isProvider } from 'feathers-hooks-common';
import { addFilesToDirectory } from './commands/addFilesToDirectory.js';
import { removeFilesFromDirectory } from './commands/removeFilesFromDirectory.js';
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
  canUserAccessDirectoryOrFilePatchMethod,
  isDirectoryReadyToDelete,
  handleAddRelatedUserDetailsQuery,
  ifNeededAddRelatedUserDetails,
  removeFromParent,
  doesUserHaveWorkspaceWriteRights, verifyDirectoryUniqueness, attachNewDirectoryToParent
} from './helpers.js';
import {authenticateJwtWhenPrivate, handlePublicOnlyQuery} from "../../hooks/handle-public-info-query.js";

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

  app.service(directoryPath).publish((data, context) => {
    return app.channel(`workspace/${context.result.workspace._id.toString()}`)
  })

  // Initialize hooks
  app.service(directoryPath).hooks({
    around: {
      all: [
        handleAddRelatedUserDetailsQuery(),
        handlePublicOnlyQuery(),
        schemaHooks.resolveExternal(directoryExternalResolver),
        schemaHooks.resolveResult(directoryResolver)
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
        iff(
          isProvider('external'),
          doesUserHaveWorkspaceWriteRights
        ),
        verifyDirectoryUniqueness,
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
        schemaHooks.validateData(directoryPatchValidator),
        schemaHooks.resolveData(directoryPatchResolver)
      ],
      remove: [
        iff(isProvider('external'), canUserAccessDirectoryOrFilePatchMethod),
        isDirectoryReadyToDelete,
      ]
    },
    after: {
      all: [],
      create: [
        attachNewDirectoryToParent,
      ],
      get: [
        ifNeededAddRelatedUserDetails,
      ],
      remove: [
        removeFromParent,
      ]
    },
    error: {
      all: []
    }
  })
}
