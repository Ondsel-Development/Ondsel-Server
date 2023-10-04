// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import {iff, isProvider, preventChanges, softDelete} from 'feathers-hooks-common';

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
} from './organization.schema.js'
import { OrganizationService, getOptions } from './organization.class.js'
import { organizationPath, organizationMethods } from './organization.shared.js'
import { addAdminsToOrganization } from './commands/addAdminsToOrganization.js';
import { removeAdminsFromOrganization } from './commands/removeAdminsFromOrganization.js';

export * from './organization.class.js'
export * from './organization.schema.js'

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
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(organizationDataValidator),
        schemaHooks.resolveData(organizationDataResolver)
      ],
      patch: [
        preventChanges(false, 'admins'),
        iff(
          context => context.data.shouldAddAdminsToOrganization,
          addAdminsToOrganization
        ),
        iff(
          context => context.data.shouldRemoveAdminsFromOrganization,
          removeAdminsFromOrganization
        ),
        schemaHooks.validateData(organizationPatchValidator),
        schemaHooks.resolveData(organizationPatchResolver)
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
