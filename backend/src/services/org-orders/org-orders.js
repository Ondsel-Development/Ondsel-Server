// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  orgOrdersDataValidator,
  orgOrdersPatchValidator,
  orgOrdersQueryValidator,
  orgOrdersResolver,
  orgOrdersExternalResolver,
  orgOrdersDataResolver,
  orgOrdersPatchResolver,
  orgOrdersQueryResolver, orgOrdersSchema, orgOrdersDataSchema, orgOrdersPatchSchema, orgOrdersQuerySchema
} from './org-orders.schema.js'
import { OrgOrdersService, getOptions } from './org-orders.class.js'
import { orgOrdersPath, orgOrdersMethods } from './org-orders.shared.js'
import {copyOrInsertOrgOrdersBeforePatch} from "./org-orders.distrib.js";
import {disallow, iff, preventChanges} from "feathers-hooks-common";
import {getNewQuote} from "./commands/getNewQuote.js";
import swagger from "feathers-swagger";
import {
  workspaceDataSchema,
  workspacePatchSchema,
  workspaceQuerySchema,
  workspaceSchema
} from "../workspaces/workspaces.schema.js";

export * from './org-orders.class.js'
export * from './org-orders.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const orgOrders = (app) => {
  // Register our service on the Feathers application
  app.use(orgOrdersPath, new OrgOrdersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: orgOrdersMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { orgOrdersSchema, orgOrdersDataSchema, orgOrdersPatchSchema , orgOrdersQuerySchema, },
      docs: {
        description: 'Organization orders for quotes and production from 3rd parties',
        idType: 'string',
        securities: ['all'],
        operations: {
          get: {
            'parameters': [
              {
                'description': 'Organization OID',
                'in': 'path',
                'name': '_id',
                'schema': {
                  'type': 'string'
                },
                'required': true,
              },
            ]
          },
          patch: {
            'parameters': [
              {
                'description': 'Organization OID',
                'in': 'path',
                'name': '_id',
                'schema': {
                  'type': 'string'
                },
                'required': true,
              },
            ]
          },
        }
      }
    })
  })
  // Initialize hooks
  app.service(orgOrdersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(orgOrdersExternalResolver),
        schemaHooks.resolveResult(orgOrdersResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(orgOrdersQueryValidator),
        schemaHooks.resolveQuery(orgOrdersQueryResolver)
      ],
      find: [],
      get: [
        copyOrInsertOrgOrdersBeforePatch,
      ],
      create: [
        disallow('external'),
        schemaHooks.validateData(orgOrdersDataValidator),
        schemaHooks.resolveData(orgOrdersDataResolver)
      ],
      patch: [
        copyOrInsertOrgOrdersBeforePatch,
        preventChanges(false, 'productionQuotes'),
        iff(
          context => context.data.shouldGetNewQuote,
          getNewQuote
        ),
        schemaHooks.validateData(orgOrdersPatchValidator),
        schemaHooks.resolveData(orgOrdersPatchResolver)
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
