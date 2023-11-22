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
  organizationQuerySchema,
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
        description: 'A organization service',
        idType: 'string',
        securities: ['all'],
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
        authenticate('jwt'),
        schemaHooks.resolveExternal(organizationExternalResolver),
        schemaHooks.resolveResult(organizationResolver)
      ]
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
        iff(isProvider('external'), disallow())
      ],
      get: [
        iff(isProvider('external'), isUserMemberOfOrganization)
      ],
      create: [
        canUserCreateOrganization,
        schemaHooks.validateData(organizationDataValidator),
        schemaHooks.resolveData(organizationDataResolver)
      ],
      patch: [
        preventChanges(false, 'admins', 'users'),
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
