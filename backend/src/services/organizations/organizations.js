// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import {disallow, iff, isProvider, preventChanges, softDelete} from 'feathers-hooks-common';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  organizationDataValidator,
  organizationPatchValidator,
  organizationQueryValidator,
  organizationResolver,
  organizationExternalResolver,
  organizationDataResolver,
  organizationPatchResolver,
  organizationQueryResolver,
  organizationSchema,
  organizationDataSchema,
  organizationPatchSchema,
  organizationQuerySchema, uniqueOrgValidator, organizationPublicFields,
} from './organizations.schema.js'
import { OrganizationService, getOptions } from './organizations.class.js'
import { organizationPath, organizationMethods } from './organizations.shared.js'
import {
  isUserMemberOfOrganization,
  isUserOwnerOrAdminOfOrganization,
  canUserCreateOrganization,
  assignOrganizationIdToUser
} from './helpers.js';
import { addUsersToOrganization } from './commands/addUsersToOrganization.js';
import { removeUsersFromOrganization } from './commands/removeUsersFromOrganization.js';
import { giveAdminAccessToUsersOfOrganization } from './commands/giveAdminAccessToUsersOfOrganization.js';
import { revokeAdminAccessFromUsersOfOrganization } from './commands/revokeAdminAccessFromUsersOfOrganization.js';
import { createDefaultEveryoneGroup } from '../groups/commands/createDefaultEveryoneGroup.js';
import { distributeOrganizationSummaries } from './organizations.distrib.js';
import { addGroupsToOrganization } from './commands/addGroupsToOrganization.js';
import {
  authenticateJwtWhenPrivate,
  handlePublicOnlyQuery,
  resolvePrivateResults
} from "../../hooks/handle-public-info-query.js";
import {userPublicFields, userResolver} from "../users/users.schema.js";

export * from './organizations.class.js'
export * from './organizations.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const organization = (app) => {
  // Register our service on the Feathers application
  app.use(organizationPath, new OrganizationService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: organizationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { organizationSchema, organizationDataSchema, organizationPatchSchema , organizationQuerySchema, },
      docs: {
        description: 'An organization service',
        idType: 'string',
        securities: ['all'],
        operations: {
          get: {
            "parameters": [
              {
                "description": "ObjectID or refName of Organization to return",
                "in": "path",
                "name": "_id",
                "schema": {
                  "type": "string"
                },
                "required": true,
              },
              {
                "description": "If provided and set to \"true\", then only return public data",
                "in": "query",
                "name": "publicInfo",
                "schema": {
                  "type": "string"
                },
                "required": false,
              },
            ],
          },
          find: {
            "parameters": [
              {
                "description": "Number of results to return",
                "in": "query",
                "name": "$limit",
                "schema": {
                  "type": "integer"
                },
                "required": false,
              },
              {
                "description": "Number of results to skip",
                "in": "query",
                "name": "$skip",
                "schema": {
                  "type": "integer"
                },
                "required": false,
              },
              {
                "description": "Query parameters",
                "in": "query",
                "name": "filter",
                "style": "form",
                "explode": true,
                "schema": {
                  "$ref": "#/components/schemas/UserQuery"
                },
                "required": false,
              },
              {
                "description": "If provided and set to \"true\", then only return public data",
                "in": "query",
                "name": "publicInfo",
                "schema": {
                  "type": "string"
                },
                "required": false,
              },
            ],
          }
        }
      }
    })
  })

  app.service(organizationPath).publish((data, context) => {
    return app.channel(context.result.users.map(user => user._id.toString()))
  })

  // Initialize hooks
  app.service(organizationPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(organizationExternalResolver),
        handlePublicOnlyQuery(organizationPublicFields),
        resolvePrivateResults(organizationResolver)
      ],
      find: [authenticateJwtWhenPrivate()],
      get: [authenticateJwtWhenPrivate()],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [
        softDelete({
          deletedQuery: async context => {
            // Allow only owner to delete organization
            if ( context.method === 'remove' && context.params.user ) {
              return { createdBy: context.params.user._id, deleted: { $ne: true } }
            }
            return { deleted: { $ne: true } };
          }
        }),
        schemaHooks.validateQuery(organizationQueryValidator),
        schemaHooks.resolveQuery(organizationQueryResolver)
      ],
      find: [
        // iff(isProvider('external'), disallow())
      ],
      get: [
        // iff(isProvider('external'), isUserMemberOfOrganization)
        detectOrgRefNameInId
      ],
      create: [
        uniqueOrgValidator,
        iff(isProvider('external'), canUserCreateOrganization),
        schemaHooks.validateData(organizationDataValidator),
        schemaHooks.resolveData(organizationDataResolver)
      ],
      patch: [
        iff(isProvider('external'), preventChanges(false, 'admins', 'users', 'owner')),
        iff(isProvider('external'), isUserOwnerOrAdminOfOrganization),
        iff(
          context => context.data.shouldAddUsersToOrganization,
          addUsersToOrganization
        ),
        iff(
          context => context.data.shouldRemoveUsersFromOrganization,
          removeUsersFromOrganization
        ),
        iff(
          context => context.data.shouldGiveAdminAccessToUsersOfOrganization,
          giveAdminAccessToUsersOfOrganization,
        ),
        iff(
          context => context.data.shouldRevokeAdminAccessFromUsersOfOrganization,
          revokeAdminAccessFromUsersOfOrganization
        ),
        iff(
          context => context.data.shouldAddGroupsToOrganization,
          addGroupsToOrganization,
        ),
        schemaHooks.validateData(organizationPatchValidator),
        schemaHooks.resolveData(organizationPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [
      ],
      create: [
        assignOrganizationIdToUser,
        createDefaultEveryoneGroup,
      ],
      patch: [
        distributeOrganizationSummaries
      ]
    },
    error: {
      all: []
    }
  })
}

const detectOrgRefNameInId = async context => {
  const id = context.id.toString();
  if (id.length < 24) { // a 24 character id is an OID not a refName, so only look at refName if shorter
    let orgList = {};
    if (context.publicDataOnly) {
      orgList = await context.service.find({
        query: {
          publicInfo: "true",
          refName: id,
          $select: organizationPublicFields,
        }
      });
    } else {
      orgList = await context.service.find(
        {query: { refName: id } }
      );
    }
    if (orgList?.total === 1) {
      context.result = orgList.data[0];
    }
  }
  return context;
}
