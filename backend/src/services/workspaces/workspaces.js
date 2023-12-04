// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import { iff, preventChanges, isProvider } from 'feathers-hooks-common';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  workspaceDataValidator,
  workspacePatchValidator,
  workspaceQueryValidator,
  workspaceResolver,
  workspaceExternalResolver,
  workspaceDataResolver,
  workspacePatchResolver,
  workspaceQueryResolver,
  workspaceDataSchema,
  workspacePatchSchema,
  workspaceQuerySchema,
  workspaceSchema, uniqueWorkspaceValidator,
} from './workspaces.schema.js'
import { WorkspaceService, getOptions } from './workspaces.class.js'
import { workspacePath, workspaceMethods } from './workspaces.shared.js'
import { isUserOwnerOrAdminOfOrganization } from '../groups/helpers.js';
import { addGroupsOrUsersToWorkspace } from './commands/addGroupsOrUsersToWorkspace.js';
import { removeGroupsOrUsersFromWorkspace } from './commands/removeGroupsOrUsersFromWorkspace.js';
import { editGroupOrUserOnWorkspace } from './commands/editGroupOrUserOnWorkspace.js';
import { isUserBelongsToWorkspace, createAndAssignRootDirectory } from './helpers.js';

export * from './workspaces.class.js'
export * from './workspaces.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const workspace = (app) => {
  // Register our service on the Feathers application
  app.use(workspacePath, new WorkspaceService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: workspaceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { workspaceSchema, workspaceDataSchema, workspacePatchSchema , workspaceQuerySchema, },
      docs: {
        description: 'A Workspace service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })

  app.service(workspacePath).publish((data, context) => {
    return app.channel(`workspace/${context.result._id.toString()}`)
  })

  // Initialize hooks
  app.service(workspacePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(workspaceExternalResolver),
        schemaHooks.resolveResult(workspaceResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(workspaceQueryValidator),
        schemaHooks.resolveQuery(workspaceQueryResolver)
      ],
      find: [
        isUserBelongsToWorkspace,
      ],
      get: [
        isUserBelongsToWorkspace,
      ],
      create: [
        schemaHooks.validateData(workspaceDataValidator),
        schemaHooks.resolveData(workspaceDataResolver),
        uniqueWorkspaceValidator,
      ],
      patch: [
        preventChanges(false, 'groupsOrUsers'),
        iff(
          isProvider('external'),
          isUserOwnerOrAdminOfOrganization,
        ),
        iff(
          context => context.data.shouldAddGroupsOrUsersToWorkspace,
          addGroupsOrUsersToWorkspace
        ),
        iff(
          context => context.data.shouldRemoveGroupsOrUsersFromWorkspace,
          removeGroupsOrUsersFromWorkspace
        ),
        iff(
          context => context.data.shouldEditGroupOrUserOnWorkspace,
          editGroupOrUserOnWorkspace,
        ),
        schemaHooks.validateData(workspacePatchValidator),
        schemaHooks.resolveData(workspacePatchResolver)
      ],
      remove: []
    },
    after: {
      all: [],
      create: [
        createAndAssignRootDirectory,
      ],
    },
    error: {
      all: []
    }
  })
}
