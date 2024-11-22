// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import { disallow, iff } from 'feathers-hooks-common';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  userEngagementsDataValidator,
  userEngagementsPatchValidator,
  userEngagementsQueryValidator,
  userEngagementsResolver,
  userEngagementsExternalResolver,
  userEngagementsDataResolver,
  userEngagementsPatchResolver,
  userEngagementsQueryResolver,
  userEngagementsSchema,
  userEngagementsDataSchema,
  userEngagementsPatchSchema,
  userEngagementsQuerySchema,
} from './user-engagements.schema.js'
import { UserEngagementsService, getOptions } from './user-engagements.class.js'
import { userEngagementsPath, userEngagementsMethods } from './user-engagements.shared.js'
import { createLaunchShareLinkInOndselEsEntry } from './commands/launchOndselEsCommand.js';

export * from './user-engagements.class.js'
export * from './user-engagements.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const userEngagements = (app) => {
  // Register our service on the Feathers application
  app.use(userEngagementsPath, new UserEngagementsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userEngagementsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { userEngagementsSchema, userEngagementsDataSchema, userEngagementsPatchSchema, userEngagementsQuerySchema },
      docs: {
        description: 'A User Engagements service',
        idType: 'string',
        securities: ['all'],
      }
    })
  })
  // Initialize hooks
  app.service(userEngagementsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(userEngagementsExternalResolver),
        schemaHooks.resolveResult(userEngagementsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(userEngagementsQueryValidator),
        schemaHooks.resolveQuery(userEngagementsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        iff(
          context => context.data.shouldLaunchShareLinkInOndselEsEntry,
          createLaunchShareLinkInOndselEsEntry,
        ),
        schemaHooks.validateData(userEngagementsDataValidator),
        schemaHooks.resolveData(userEngagementsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(userEngagementsPatchValidator),
        schemaHooks.resolveData(userEngagementsPatchResolver)
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
