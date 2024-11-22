// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  agreementsDataValidator,
  agreementsPatchValidator,
  agreementsQueryValidator,
  agreementsResolver,
  agreementsExternalResolver,
  agreementsDataResolver,
  agreementsPatchResolver,
  agreementsQueryResolver, agreementsSchema, agreementsQuerySchema
} from './agreements.schema.js'
import { AgreementsService, getOptions } from './agreements.class.js'
import { agreementsPath, agreementsMethods } from './agreements.shared.js'
import {authenticate} from "@feathersjs/authentication";
import swagger from "feathers-swagger";
import {disallow, iff, isProvider, preventChanges} from "feathers-hooks-common";
import {canUserAccessDirectoryOrFilePatchMethod} from "../directories/helpers.js";
import {BadRequest} from "@feathersjs/errors";
import {isAdminUser} from "../../hooks/is-user.js";
import {verifyOndselAdministrativePower} from "../hooks/administration.js";

export * from './agreements.class.js'
export * from './agreements.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const agreements = (app) => {
  // Register our service on the Feathers application
  app.use(agreementsPath, new AgreementsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: agreementsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { agreementsSchema, agreementsQuerySchema },
      docs: {
        description: 'An agreements service',
        idType: 'string',
        securities: ['all'],
      }
    }),
  })
  // Initialize hooks
  app.service(agreementsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(agreementsExternalResolver),
        schemaHooks.resolveResult(agreementsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(agreementsQueryValidator),
        schemaHooks.resolveQuery(agreementsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        verifyOndselAdministrativePower,
        schemaHooks.validateData(agreementsDataValidator),
        schemaHooks.resolveData(agreementsDataResolver)
      ],
      patch: [
        iff(
          isProvider('external'),
          isTripe
        ),
        schemaHooks.validateData(agreementsPatchValidator),
        schemaHooks.resolveData(agreementsPatchResolver)
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

export const isTripe = async context => {
  if (context.params.user && context.params.user.isTripe) {
    return context;
  }
  throw new BadRequest({ type: 'PermissionError', msg: 'You dont have permission'});
}
