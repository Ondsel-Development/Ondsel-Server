// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import {iff, preventChanges, isProvider, softDelete} from 'feathers-hooks-common';

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
  workspaceSchema, uniqueWorkspaceValidator, workspacePublicFields,
} from './workspaces.schema.js'
import { WorkspaceService, getOptions } from './workspaces.class.js'
import { workspacePath, workspaceMethods } from './workspaces.shared.js'
import { isUserOwnerOrAdminOfOrganization } from '../groups/helpers.js';
import { addGroupsOrUsersToWorkspace } from './commands/addGroupsOrUsersToWorkspace.js';
import { removeGroupsOrUsersFromWorkspace } from './commands/removeGroupsOrUsersFromWorkspace.js';
import { editGroupOrUserOnWorkspace } from './commands/editGroupOrUserOnWorkspace.js';
import {
  isUserBelongsToWorkspace,
  createAndAssignRootDirectory,
  limitPublicOnlyRequestsToOpenWorkspaces, addEveryoneGroupIfNeeded
} from './helpers.js';
import {
  authenticateJwtWhenPrivate,
  handlePublicOnlyQuery,
  resolvePrivateResults
} from '../../hooks/handle-public-info-query.js';
import {
  copyWorkspaceBeforePatch,
  distributeWorkspaceSummaries,
  removeRelatedWorkspaceSummaries
} from "./workspaces.distrib.js";
import {representWorkspaceWithFile} from "./commands/representWorkspaceWithFile.js";
import {
  afterCreateHandleWorkspaceCuration,
  buildNewCurationForWorkspace
} from "./workspaces.curation.js";
import {beforePatchHandleGenericCuration, removeCurationFromSearch} from "../../curation.schema.js";
import {removeWorkspace} from "./commands/removeWorkspace.js";

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
        operations: {
          get: {
           'parameters': [
             {
               'description': 'ID of Workspace to return',
               'in': 'path',
               'name': '_id',
               'schema': {
                 'type': 'string'
               },
               'required': true,
             },
             {
               'description': 'If provided and set to \'true\', then only return public data',
               'in': 'query',
               'name': 'publicInfo',
               'schema': {
                 'type': 'string'
               },
               'required': false,
             },
           ]
          },
          find: {
            "parameters": [
              {
                "description": "Number of results to return",
                "in": "query",
                "name": "$limit",
                "schema": {
                  "type": "integer"
                }
              },
              {
                "description": "Number of results to skip",
                "in": "query",
                "name": "$skip",
                "schema": {
                  "type": "integer"
                }
              },
              {
                'description': 'If provided and set to \'true\', then only return open workspace details; No auth needed.',
                'in': 'query',
                'name': 'publicInfo',
                'schema': {
                  'type': 'string'
                },
                'required': false,
              },
              {
                "description": "Query parameters",
                "in": "query",
                "name": "filter",
                "style": "form",
                "explode": true,
                "schema": {
                  "$ref": "#/components/schemas/WorkspaceQuery"
                }
              }
            ]
          },
        }
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
        schemaHooks.resolveExternal(workspaceExternalResolver),
        handlePublicOnlyQuery(workspacePublicFields),
        resolvePrivateResults(workspaceResolver),
      ],
      find: [authenticateJwtWhenPrivate()],
      get: [authenticateJwtWhenPrivate()],
      create: [authenticate('jwt')],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')],
    },
    before: {
      all: [
        iff(isProvider('external'), schemaHooks.validateQuery(workspaceQueryValidator)),
        schemaHooks.resolveQuery(workspaceQueryResolver),
      ],
      find: [
        softDelete(),
        isUserBelongsToWorkspace,
        limitPublicOnlyRequestsToOpenWorkspaces,
      ],
      get: [
        softDelete(),
        isUserBelongsToWorkspace,
      ],
      create: [
        schemaHooks.validateData(workspaceDataValidator),
        schemaHooks.resolveData(workspaceDataResolver),
        uniqueWorkspaceValidator,
      ],
      patch: [
        softDelete(),
        copyWorkspaceBeforePatch,
        preventChanges(false, 'groupsOrUsers'),
        // preventChanges(isProvider('external'), 'deleted', 'deletedAt', 'deletedBy'),
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
        iff(
          context => context.data.shouldRepresentWorkspaceWithFile,
          representWorkspaceWithFile,
        ),
        beforePatchHandleGenericCuration(buildNewCurationForWorkspace),
        schemaHooks.validateData(workspacePatchValidator),
        schemaHooks.resolveData(workspacePatchResolver)
      ],
      remove: [removeWorkspace],
    },
    after: {
      all: [],
      patch: [
        distributeWorkspaceSummaries,
      ],
      create: [
        createAndAssignRootDirectory,
        addEveryoneGroupIfNeeded,
        afterCreateHandleWorkspaceCuration,
      ],
      remove: [
        removeRelatedWorkspaceSummaries,
        removeCurationFromSearch,
      ]
    },
    error: {
      all: []
    }
  })
}
