// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  keywordsDataValidator,
  keywordsPatchValidator,
  keywordsQueryValidator,
  keywordsResolver,
  keywordsExternalResolver,
  keywordsDataResolver,
  keywordsPatchResolver,
  keywordsQueryResolver, keywordsSchema, keywordsDataSchema, keywordsPatchSchema, keywordsQuerySchema
} from './keywords.schema.js'
import { KeywordsService, getOptions } from './keywords.class.js'
import { keywordsPath, keywordsMethods } from './keywords.shared.js'
import {disallow, iff} from "feathers-hooks-common";
import swagger from "feathers-swagger";
import {upsertScore} from "./commands/upsertScore.js";

export * from './keywords.class.js'
export * from './keywords.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const keywords = (app) => {
  // Register our service on the Feathers application
  app.use(keywordsPath, new KeywordsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: keywordsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { keywordsSchema, keywordsDataSchema, keywordsPatchSchema , keywordsQuerySchema, },
      docs: {
        description: 'The keyword service.',
        idType: 'string',
        securities: ['all'],
        operations: {
          get: {
            'parameters': [
              {
                'description': 'keyword/keyphrase to return',
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
  app.service(keywordsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(keywordsExternalResolver),
        schemaHooks.resolveResult(keywordsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(keywordsQueryValidator),
        schemaHooks.resolveQuery(keywordsQueryResolver)
      ],
      find: [
        disallow('external'),
      ],
      get: [], // this is the only endpoint seen by the public
      create: [
        disallow('external'),
        schemaHooks.validateData(keywordsDataValidator),
        schemaHooks.resolveData(keywordsDataResolver)
      ],
      patch: [
        disallow('external'),
        iff(
          context => context.data.shouldUpsertScore,
          upsertScore,
        ),
        schemaHooks.validateData(keywordsPatchValidator),
        schemaHooks.resolveData(keywordsPatchResolver)
      ],
      remove: [
        disallow('external'),
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
