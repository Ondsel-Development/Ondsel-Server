// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import swagger from 'feathers-swagger';
import { authenticate } from '@feathersjs/authentication'

import {disallow, iff, isProvider} from 'feathers-hooks-common';
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  preferencesDataValidator,
  preferencesPatchValidator,
  preferencesQueryValidator,
  preferencesResolver,
  preferencesExternalResolver,
  preferencesDataResolver,
  preferencesPatchResolver,
  preferencesQueryResolver,
  preferencesSchema,
  preferencesDataSchema,
  preferencesPatchSchema,
  preferencesQuerySchema,
} from './preferences.schema.js'
import { PreferencesService, getOptions } from './preferences.class.js'
import { preferencesPath, preferencesMethods } from './preferences.shared.js'
import {canUserHaveGetAccess, isUserHavePatchAccess, validateAndFeedCreatePayload} from './helpers.js';
import { commitNewVersion } from './commands/commitNewVersion.js';
import { checkoutToVersion } from './commands/checkoutToVersion.js';

export * from './preferences.class.js'
export * from './preferences.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const preferences = (app) => {
  // Register our service on the Feathers application
  app.use(preferencesPath, new PreferencesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: preferencesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { preferencesSchema, preferencesDataSchema, preferencesPatchSchema , preferencesQuerySchema, },
      docs: {
        description: 'A preferences service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(preferencesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(preferencesExternalResolver),
        schemaHooks.resolveResult(preferencesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(preferencesQueryValidator),
        schemaHooks.resolveQuery(preferencesQueryResolver)
      ],
      find: [
        disallow('external'),
      ],
      get: [
        iff(
          isProvider('external'),
          canUserHaveGetAccess
        )
      ],
      create: [
        validateAndFeedCreatePayload,
        schemaHooks.validateData(preferencesDataValidator),
        schemaHooks.resolveData(preferencesDataResolver),
      ],
      patch: [
        isUserHavePatchAccess,
        iff(
          context => context.data.shouldCommitNewVersion,
          commitNewVersion
        ),
        iff(
          context => context.data.shouldCheckoutToVersion,
          checkoutToVersion
        ),
        schemaHooks.validateData(preferencesPatchValidator),
        schemaHooks.resolveData(preferencesPatchResolver)
      ],
      remove: [
        disallow()
      ]
    },
    after: {
      all: [],
      create: [
        async context => {
          await context.app.service('organizations').patch(
            context.result.organization._id,
            { preferencesId: context.result._id }
          );
        }
      ]
    },
    error: {
      all: []
    }
  })
}
