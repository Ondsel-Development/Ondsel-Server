// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  acceptAgreementDataValidator,
  acceptAgreementPatchValidator,
  acceptAgreementQueryValidator,
  acceptAgreementResolver,
  acceptAgreementExternalResolver,
  acceptAgreementDataResolver,
  acceptAgreementPatchResolver,
  acceptAgreementQueryResolver, acceptAgreementSchema
} from './accept.schema.js'
import { AcceptAgreementService, getOptions } from './accept.class.js'
import { acceptAgreementPath, acceptAgreementMethods } from './accept.shared.js'
import swagger from "feathers-swagger";
import {agreementsQuerySchema, agreementsSchema} from "../agreements.schema.js";
import {doAcceptOneAgreement} from "./hooks/DoAcceptOneAgreement.js";
import {BadRequest} from "@feathersjs/errors";

export * from './accept.class.js'
export * from './accept.schema.js'

export const ThrowOnBadData = async (context) => {
  if (!context.data.dbResultMsg.startsWith("SUCCESS")) {
    throw new BadRequest(context.data.dbResultMsg);
  }
}

// A configure function that registers the service and its hooks via `app.configure`
export const acceptAgreement = (app) => {
  // Register our service on the Feathers application
  app.use(acceptAgreementPath, new AcceptAgreementService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: acceptAgreementMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { acceptAgreementSchema },
      docs: {
        description: 'An agreements service',
        idType: 'string',
        securities: ['all'],
      }
    }),
  })
  // Initialize hooks
  app.service(acceptAgreementPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(acceptAgreementExternalResolver),
        schemaHooks.resolveResult(acceptAgreementResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(acceptAgreementQueryValidator),
        schemaHooks.resolveQuery(acceptAgreementQueryResolver)
      ],
      create: [
        schemaHooks.validateData(acceptAgreementDataValidator),
        schemaHooks.resolveData(acceptAgreementDataResolver),
        doAcceptOneAgreement
      ],
    },
    after: {
      all: [],
      create: [
        ThrowOnBadData // do this "after" so that the log is still stored.
      ],
    },
    error: {
      all: []
    }
  })
}
