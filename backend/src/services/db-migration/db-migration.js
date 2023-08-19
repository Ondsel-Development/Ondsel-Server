// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  dbMigrationDataValidator,
  dbMigrationPatchValidator,
  dbMigrationQueryValidator,
  dbMigrationResolver,
  dbMigrationExternalResolver,
  dbMigrationDataResolver,
  dbMigrationPatchResolver,
  dbMigrationQueryResolver, dbMigrationSchema
} from './db-migration.schema.js'
import { DbMigrationService, getOptions } from './db-migration.class.js'
import { dbMigrationPath, dbMigrationMethods } from './db-migration.shared.js'
import {doDbMigration} from "./hooks/do-db-migration.js";
import swagger from "feathers-swagger";
import {accountEventOptionsSchema, accountEventSchema} from "../account-event/account-event.schema.js";

export * from './db-migration.class.js'
export * from './db-migration.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const dbMigration = (app) => {
  // Register our service on the Feathers application
  app.use(dbMigrationPath, new DbMigrationService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: dbMigrationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { dbMigrationSchema },
      docs: {
        description: 'Place to start single-use db migration calls.',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(dbMigrationPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(dbMigrationExternalResolver),
        schemaHooks.resolveResult(dbMigrationResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(dbMigrationQueryValidator),
        schemaHooks.resolveQuery(dbMigrationQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(dbMigrationDataValidator),
        schemaHooks.resolveData(dbMigrationDataResolver),
        doDbMigration,
      ],
      patch: [],
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
